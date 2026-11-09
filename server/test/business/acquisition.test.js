import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import knex from "../../src/controllers/dbConnection.js";
import { previewAcquisition, acquireProperty } from "../../src/services/business/acquisitionService.js";
import { getTrialBalance } from "../../src/services/business/reportsService.js";
import { ValidationError } from "../../src/utils/errors.js";

let entityId;
let propertyId;
let chaseBankAccountId;

// A sample closing statement:
//   price 350,000 + title/recording/transfer tax 4,200 − seller credit 2,000
//     = basis 352,200 → land 25% 88,050, building 264,150
//   lender fees 3,500 · prepaid interest 420.50 · taxes 1,180
//   insurance 1,450 · escrow deposit 2,400            costs 361,150.50
//   paid by: loan 280,000 + earnest money (personal) 5,000
//     + wire from Chase 76,150.50                      paid 361,150.50
const CLOSING = {
  closingDate: "2027-09-10",
  inServiceDate: "2027-09-10",
  purchasePriceCents: 35000000,
  landPercent: 25,
  capitalizedCostsCents: 420000,
  sellerCreditsCents: 200000,
  loanCostsCents: 350000,
  prepaidInterestCents: 42050,
  propertyTaxCents: 118000,
  insuranceCents: 145000,
  escrowDepositCents: 240000,
  loanAmountCents: 28000000,
  bankTransactionId: null,
  bankCents: 7615050,
  personalFundsCents: 500000,
};

before(async () => {
  entityId = (await knex("entities").first()).entity_id;
  const chase = await knex("bank_accounts")
    .join("accounts", "accounts.account_id", "bank_accounts.account_id")
    .where("accounts.account_number", 1000)
    .first("bank_accounts.bank_account_id");
  chaseBankAccountId = chase.bank_account_id;
});

beforeEach(async () => {
  await knex.raw(
    "truncate reconciled_lines, reconciliations, bank_transactions, rules, journal_lines, journal_entries, period_locks, property_valuations, mortgages, cpa_depreciation, fixed_assets, properties restart identity",
  );
  [{ property_id: propertyId }] = await knex("properties")
    .insert({ entity_id: entityId, name: "Duplex", status: "pre_rental" })
    .returning("property_id");
});

after(() => knex.destroy());

const balanceOf = (trialBalance, number) => {
  const row = trialBalance.rows.find((item) => item.account_number === number);
  return row ? row.debit_cents - row.credit_cents : 0;
};

const countEntries = async () => {
  const row = await knex("journal_entries").count({ count: "*" }).first();
  return Number(row.count);
};

test("a sample closing statement posts one balanced entry, each amount to its own account", async () => {
  const result = await acquireProperty(propertyId, CLOSING);

  assert.deepEqual([result.basis_cents, result.land_cents, result.building_cents], [35220000, 8805000, 26415000]);
  const trialBalance = await getTrialBalance({ entityId, asOfDate: "2027-09-30" });
  assert.equal(trialBalance.total_debit_cents, trialBalance.total_credit_cents);
  assert.deepEqual(
    [1500, 1510, 1700, 5070, 5110, 5040, 1100, 2200, 3000, 1000].map((number) => balanceOf(trialBalance, number)),
    [8805000, 26415000, 350000, 42050, 118000, 145000, 240000, -28000000, -500000, -7615050],
  );

  const property = await knex("properties").where({ property_id: propertyId }).first();
  assert.equal(property.status, "active");
  assert.equal((await knex("fixed_assets")).length, 2);
});

test("a closing statement that doesn't add up is refused, and the preview shows by how much", async () => {
  const unbalanced = { ...CLOSING, bankCents: 7600000 };

  const preview = await previewAcquisition(propertyId, unbalanced);
  assert.equal(preview.difference_cents, 15050);

  await assert.rejects(acquireProperty(propertyId, unbalanced), ValidationError);
  assert.equal(await countEntries(), 0);
});

test("picking the imported wire uses its amount and posts it with the purchase, so it isn't counted twice", async () => {
  const [{ bank_transaction_id: wireId }] = await knex("bank_transactions")
    .insert({
      bank_account_id: chaseBankAccountId,
      transaction_date: "2027-09-09",
      description: "WIRE TO TITLE CO",
      amount_cents: -7615050,
      dedupe_hash: "wire",
      csv_row: {},
    })
    .returning("bank_transaction_id");

  const result = await acquireProperty(propertyId, { ...CLOSING, bankTransactionId: wireId, bankCents: 0 });

  const wire = await knex("bank_transactions").where({ bank_transaction_id: wireId }).first();
  assert.equal(wire.status, "posted");
  assert.equal(wire.journal_entry_id, result.journal_entry_id);
  assert.equal(await countEntries(), 1);
});
