import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import knex from "../../src/controllers/dbConnection.js";
import { getDashboard } from "../../src/services/business/dashboardService.js";
import { postJournalEntry } from "../../src/services/business/postingService.js";

const accountIdsByNumber = {};
let entityId;
let chaseBankAccountId;

before(async () => {
  for (const account of await knex("accounts")) {
    accountIdsByNumber[account.account_number] = account.account_id;
  }
  entityId = (await knex("entities").first()).entity_id;
  chaseBankAccountId = (
    await knex("bank_accounts").where({ account_id: accountIdsByNumber[1000] }).first()
  ).bank_account_id;
});

// October 2026, before launch: $10,200 contributed to Chase, $41.84 of
// supplies and $22.26 of rental prep from Chase, a $100 supplies charge on
// the WF card. The house is set to convert July 1, 2027. One Chase
// transaction waits in the Inbox, and Chase was never reconciled.
beforeEach(async () => {
  await knex.raw(
    "truncate reconciled_lines, reconciliations, bank_transactions, rules, journal_lines, journal_entries, period_locks, property_valuations, mortgages, cpa_depreciation, fixed_assets, leases, capex_components, properties restart identity",
  );
  await knex("properties").insert({
    entity_id: entityId,
    name: "Home",
    status: "pre_rental",
    target_conversion_date: "2027-07-01",
  });
  await post("2026-10-19", [line(1000, 1020000, "debit"), line(3000, 1020000, "credit")]);
  await post("2026-10-25", [line(5100, 4184, "debit"), line(1000, 4184, "credit")]);
  await post("2026-10-26", [{ ...line(1600, 2226, "debit"), needsCpaReview: true }, line(1000, 2226, "credit")]);
  await post("2026-10-27", [line(5100, 10000, "debit"), line(2000, 10000, "credit")]);
  await knex("bank_transactions").insert({
    bank_account_id: chaseBankAccountId,
    transaction_date: "2026-11-03",
    description: "NEW ONE",
    amount_cents: -500,
    dedupe_hash: "x",
    csv_row: {},
  });
});

after(() => knex.destroy());

function post(entryDate, lines) {
  return postJournalEntry({ entityId, entryDate, memo: null, source: "manual", lines });
}
const line = (number, cents, side) => ({
  accountId: accountIdsByNumber[number],
  [side === "debit" ? "debitCents" : "creditCents"]: cents,
});

test("before launch the dashboard shows cash, money in and out, days to conversion, and what needs doing", async () => {
  const dashboard = await getDashboard({ entityId, asOfDate: "2026-11-15" });

  assert.equal(dashboard.phase, "pre_launch");
  assert.equal(dashboard.cash_cents, 1020000 - 4184 - 2226);
  assert.equal(dashboard.card_owed_cents, 10000);
  assert.equal(dashboard.contributed_cents, 1020000);
  assert.equal(dashboard.spent_cents, 4184 + 10000 + 2226);
  assert.equal(dashboard.days_to_conversion, 228);
  assert.equal(dashboard.operating, null);
  assert.equal(dashboard.alerts.inbox_count, 1);
  assert.deepEqual(
    dashboard.alerts.unreconciled_accounts.map((account) => account.name).sort(),
    (await knex("bank_accounts").whereIn("account_id", [accountIdsByNumber[1000], accountIdsByNumber[2000]]).pluck("name")).sort(),
  );
  assert.equal(dashboard.alerts.cpa_flag_count, 1);
});

test("once a property is in service the dashboard adds the rental KPIs", async () => {
  await knex("properties").update({ status: "active", placed_in_service_date: "2026-10-01" });

  const dashboard = await getDashboard({ entityId, asOfDate: "2026-11-15" });

  assert.equal(dashboard.phase, "operating");
  assert.ok(dashboard.operating);
  assert.equal(typeof dashboard.operating.noi_ytd_cents, "number");
});
