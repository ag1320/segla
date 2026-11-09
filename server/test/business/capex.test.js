import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import knex from "../../src/controllers/dbConnection.js";
import {
  createCapexComponent,
  editCapexComponent,
  setCapexReserveAccount,
  getCapexPlan,
} from "../../src/services/business/capexService.js";
import { postJournalEntry } from "../../src/services/business/postingService.js";

const RESERVE_ACCOUNT_NUMBER = 1020;

let entityId;
let propertyId;
let reserveAccountId;
let checkingAccountId;

before(async () => {
  entityId = (await knex("entities").first()).entity_id;
  await knex("accounts")
    .insert({ account_number: RESERVE_ACCOUNT_NUMBER, name: "Reserve Savings", account_type: "asset" })
    .onConflict("account_number")
    .ignore();
  reserveAccountId = (await knex("accounts").where({ account_number: RESERVE_ACCOUNT_NUMBER }).first()).account_id;
  checkingAccountId = (await knex("accounts").where({ account_number: 1000 }).first()).account_id;
});

beforeEach(async () => {
  await knex("entities").update({ capex_reserve_account_id: null });
  await knex.raw(
    "truncate reconciled_lines, reconciliations, bank_transactions, rules, journal_lines, journal_entries, period_locks, property_valuations, mortgages, cpa_depreciation, fixed_assets, leases, capex_components, properties restart identity",
  );
  [{ property_id: propertyId }] = await knex("properties")
    .insert({ entity_id: entityId, name: "Rental", status: "active" })
    .returning("property_id");
});

after(async () => {
  await knex("entities").update({ capex_reserve_account_id: null });
  await knex.destroy();
});

// In 2027: a $15,000 roof from 2015 with a 25-year life is 12 years in,
// so 15,000 × 12/25 = $7,200 should be saved. A $1,800 water heater from
// 2019 with a 12-year life: 1,800 × 8/12 = $1,200. Target $8,400; yearly
// pace 15,000/25 + 1,800/12 = $750.
test("the reserve target follows each component's age, and updates when a component changes", async () => {
  const roof = await createCapexComponent({
    propertyId,
    name: "Roof",
    installYear: 2015,
    usefulLifeYears: 25,
    replacementCostCents: 1500000,
  });
  await createCapexComponent({
    propertyId,
    name: "Water heater",
    installYear: 2019,
    usefulLifeYears: 12,
    replacementCostCents: 180000,
  });

  const plan = await getCapexPlan({ entityId, asOfDate: "2027-06-30" });
  assert.equal(plan.target_cents, 840000);
  assert.equal(plan.annual_contribution_cents, 75000);
  const waterHeaterYear = plan.forecast.find((year) => year.year === 2031);
  assert.equal(waterHeaterYear.replacements_cents, 180000);
  assert.equal(sumReplacements(plan), 180000);

  await editCapexComponent(roof.capex_component_id, { installYear: 2020 });
  const replanned = await getCapexPlan({ entityId, asOfDate: "2027-06-30" });
  assert.equal(replanned.target_cents, 420000 + 120000);
});

test("funded is the reserve account's balance over the target", async () => {
  await createCapexComponent({
    propertyId,
    name: "Water heater",
    installYear: 2019,
    usefulLifeYears: 12,
    replacementCostCents: 180000,
  });
  await setCapexReserveAccount(entityId, reserveAccountId);
  await postJournalEntry({
    entityId,
    entryDate: "2027-03-01",
    memo: "Move to reserve",
    source: "manual",
    lines: [
      { accountId: reserveAccountId, debitCents: 60000 },
      { accountId: checkingAccountId, creditCents: 60000 },
    ],
  });

  const plan = await getCapexPlan({ entityId, asOfDate: "2027-06-30" });
  assert.equal(plan.reserve_cents, 60000);
  assert.equal(plan.funded_ratio, 60000 / 120000);
});

function sumReplacements(plan) {
  return plan.forecast.reduce((total, year) => total + year.replacements_cents, 0);
}
