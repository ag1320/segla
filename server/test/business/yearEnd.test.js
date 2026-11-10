import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import knex from "../../src/controllers/dbConnection.js";
import { get1099Candidates, getStartupCosts } from "../../src/services/business/yearEndService.js";
import { postJournalEntry } from "../../src/services/business/postingService.js";

const accountIdsByNumber = {};
let entityId;
let vendorIds;

before(async () => {
  for (const account of await knex("accounts")) {
    accountIdsByNumber[account.account_number] = account.account_id;
  }
  entityId = (await knex("entities").first()).entity_id;
});

beforeEach(async () => {
  await knex.raw(
    "truncate reconciled_lines, reconciliations, bank_transactions, rules, journal_lines, journal_entries, period_locks, property_valuations, mortgages, cpa_depreciation, fixed_assets, leases, capex_components, properties, vendors restart identity",
  );
  const rows = await knex("vendors")
    .insert([
      { name: "Joe Handyman", is_1099_eligible: true },
      { name: "Pro Cleaners", is_1099_eligible: true, has_w9_on_file: true, w9_location: "Drive/W9s" },
      { name: "Home Depot", is_1099_eligible: false },
    ])
    .returning(["vendor_id", "name"]);
  vendorIds = Object.fromEntries(rows.map((row) => [row.name, row.vendor_id]));
});

after(() => knex.destroy());

// A vendor's service paid from one account.
function pay({ vendor, cents, from, date = "2026-06-01" }) {
  return postJournalEntry({
    entityId,
    entryDate: date,
    memo: null,
    source: "manual",
    lines: [
      { accountId: accountIdsByNumber[5090], vendorId: vendorIds[vendor], debitCents: cents },
      { accountId: accountIdsByNumber[from], creditCents: cents },
    ],
  });
}

// 2026: Joe gets $1,500 by check from Chase, $700 paid personally (an
// owner contribution) and $400 on the WF card. Only $2,200 counts, which
// meets 2026's $2,000 threshold. Pro Cleaners was paid $3,000, all by
// card, so no 1099. Home Depot sells goods and isn't 1099-eligible.
test("card payments are excluded from the 1099 list; bank and personal payments count", async () => {
  await pay({ vendor: "Joe Handyman", cents: 150000, from: 1000 });
  await pay({ vendor: "Joe Handyman", cents: 70000, from: 3000 });
  await pay({ vendor: "Joe Handyman", cents: 40000, from: 2000 });
  await pay({ vendor: "Pro Cleaners", cents: 300000, from: 2000 });
  await pay({ vendor: "Home Depot", cents: 90000, from: 1000 });

  const candidates = await get1099Candidates({ entityId, taxYear: 2026 });

  assert.equal(candidates.threshold_cents, 200000);
  assert.deepEqual(
    candidates.rows.map((row) => [row.name, row.card_cents, row.bank_cents, row.personal_cents, row.needs_1099, row.has_w9_on_file]),
    [
      ["Joe Handyman", 40000, 150000, 70000, true, false],
      ["Pro Cleaners", 300000, 0, 0, false, true],
    ],
  );
});

test("through 2025 the threshold is $600", async () => {
  await pay({ vendor: "Joe Handyman", cents: 60000, from: 1000, date: "2025-06-01" });

  const candidates = await get1099Candidates({ entityId, taxYear: 2025 });

  assert.equal(candidates.threshold_cents, 60000);
  assert.equal(candidates.rows[0].needs_1099, true);
});

test("the startup-cost summary lists 1600 by property with each line's memo and CPA flag", async () => {
  const [{ property_id: elmId }] = await knex("properties")
    .insert({ entity_id: entityId, name: "Elm", status: "pre_rental" })
    .returning("property_id");
  await postJournalEntry({
    entityId,
    entryDate: "2026-10-26",
    memo: "Toilet seat, peeling, replaced for tenants",
    source: "manual",
    lines: [
      { accountId: accountIdsByNumber[1600], propertyId: elmId, vendorId: vendorIds["Home Depot"], debitCents: 2226, needsCpaReview: true },
      { accountId: accountIdsByNumber[1000], creditCents: 2226 },
    ],
  });
  await postJournalEntry({
    entityId,
    entryDate: "2026-10-28",
    memo: "Business formation filing",
    source: "manual",
    lines: [
      { accountId: accountIdsByNumber[1600], debitCents: 5000 },
      { accountId: accountIdsByNumber[1000], creditCents: 5000 },
    ],
  });

  const summary = await getStartupCosts({ entityId, asOfDate: "2026-12-31" });

  assert.equal(summary.total_cents, 7226);
  const elm = summary.rows.find((row) => row.property_name === "Elm");
  assert.deepEqual(
    elm.lines.map((line) => [line.memo, line.vendor_name, line.amount_cents, line.needs_cpa_review]),
    [["Toilet seat, peeling, replaced for tenants", "Home Depot", 2226, true]],
  );
  assert.equal(summary.rows.find((row) => row.property_id === null).total_cents, 5000);
});
