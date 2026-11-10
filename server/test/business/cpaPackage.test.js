import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import knex from "../../src/controllers/dbConnection.js";
import { getPackageFile, PACKAGE_FILES } from "../../src/services/business/cpaPackageService.js";
import { postJournalEntry } from "../../src/services/business/postingService.js";
import { createFixedAsset } from "../../src/services/business/fixedAssetsService.js";
import { postDepreciationThrough } from "../../src/services/business/depreciationPostingService.js";
import { closeYear } from "../../src/services/business/yearCloseService.js";

const accountIdsByNumber = {};
let entityId;
let propertyId;

before(async () => {
  for (const account of await knex("accounts")) {
    accountIdsByNumber[account.account_number] = account.account_id;
  }
  entityId = (await knex("entities").first()).entity_id;
});

// A 2024 on one rental: rent, a flagged repair, mortgage interest, a
// $110,000 building depreciated from Jan 1, then the year closed.
beforeEach(async () => {
  await knex.raw(
    "truncate reconciled_lines, reconciliations, bank_transactions, rules, journal_lines, journal_entries, period_locks, property_valuations, mortgages, cpa_depreciation, fixed_assets, leases, capex_components, properties restart identity",
  );
  [{ property_id: propertyId }] = await knex("properties")
    .insert({ entity_id: entityId, name: "Rental", status: "active", placed_in_service_date: "2024-01-01" })
    .returning("property_id");
  await knex("mortgages").insert({
    property_id: propertyId,
    lender: "Test Bank",
    original_principal_cents: 20000000,
    annual_rate_percent: 6,
    term_months: 360,
    first_payment_date: "2024-01-01",
    monthly_escrow_cents: 0,
    liability_account_id: accountIdsByNumber[2200],
  });
  await post("2024-03-01", [line(1000, 1200000, "debit"), line(4000, 1200000, "credit", propertyId)]);
  await post("2024-05-01", [{ ...line(5090, 30000, "debit", propertyId), needsCpaReview: true }, line(1000, 30000, "credit")]);
  await post("2024-12-01", [line(5070, 1190000, "debit", propertyId), line(1000, 1190000, "credit")]);
  await createFixedAsset({ propertyId, name: "Building", assetClass: "building", costCents: 11000000, inServiceDate: "2024-01-01" });
  await postDepreciationThrough({ entityId, throughDate: "2024-12-31" });
  await closeYear({ entityId, year: 2024 });
});

after(() => knex.destroy());

function post(entryDate, lines) {
  return postJournalEntry({ entityId, entryDate, memo: null, source: "manual", lines });
}
const line = (number, cents, side, propertyTag = null) => ({
  accountId: accountIdsByNumber[number],
  propertyId: propertyTag,
  [side === "debit" ? "debitCents" : "creditCents"]: cents,
});

test("every package file builds, with only plain cells Excel can open", async () => {
  for (const file of Object.keys(PACKAGE_FILES)) {
    const packageFile = await getPackageFile({ file, entityId, taxYear: 2024, allocation: "equal" });
    assert.equal(packageFile.file_name, `${file}_2024.csv`);
    assert.ok(packageFile.rows.length >= 1, file);
    for (const row of packageFile.rows) {
      assert.ok(Array.isArray(row), file);
      assert.ok(row.every((cell) => ["string", "number"].includes(typeof cell)), `${file}: ${JSON.stringify(row)}`);
    }
  }
});

test("the trial balance shows the year before its close, and the rollforward ties to the books", async () => {
  const trialBalance = await getPackageFile({ file: "trial-balance", entityId, taxYear: 2024 });
  const rent = trialBalance.rows.find((row) => row[0] === 4000);
  assert.equal(rent[3], "12000.00");
  const totals = trialBalance.rows.at(-1);
  assert.equal(totals[2], totals[3]);

  const rollforward = await getPackageFile({ file: "fixed-asset-rollforward", entityId, taxYear: 2024 });
  const [scheduleRow, booksRow] = rollforward.rows.slice(-2);
  assert.equal(scheduleRow.at(-1), booksRow.at(-1));

  const interest = await getPackageFile({ file: "interest-summary", entityId, taxYear: 2024 });
  assert.equal(interest.rows[1][3], "11900.00");
});
