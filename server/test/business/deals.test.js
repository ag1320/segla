import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import knex from "../../src/controllers/dbConnection.js";
import { analyzeDeal } from "../../src/services/business/dealAnalysis.js";
import { createDeal, editDeal, listDeals } from "../../src/services/business/dealsService.js";

let entityId;

// A $300,000 house, $6,000 closing costs, $4,000 of repairs, 25% down,
// the rest at 7% for 30 years ($1,496.93 a month, the standard figure).
// Rent $2,500, 5% vacancy, taxes $3,600, insurance $1,500, 5% each for
// repairs and capex. By hand:
//   gross rent 30,000 − vacancy 1,500        = EGI 28,500
//   expenses 3,600 + 1,500 + 1,425 + 1,425    = 7,950
//   NOI 20,550                                  cap rate 20,550 / 300,000 = 6.85%
//   debt service 1,496.93 × 12 = 17,963.16     DSCR 20,550 / 17,963.16 = 1.144
//   cash flow 2,586.84 on 85,000 invested      cash-on-cash 3.04%
const DEAL = {
  purchasePriceCents: 30000000,
  closingCostsCents: 600000,
  rehabCents: 400000,
  downPaymentPercent: 25,
  interestRatePercent: 7,
  termYears: 30,
  monthlyRentCents: 250000,
  otherMonthlyIncomeCents: 0,
  vacancyPercent: 5,
  propertyTaxCents: 360000,
  insuranceCents: 150000,
  repairsPercent: 5,
  capexPercent: 5,
  managementPercent: 0,
  utilitiesMonthlyCents: 0,
  hoaMonthlyCents: 0,
  otherExpensesCents: 0,
};

before(async () => {
  entityId = (await knex("entities").first()).entity_id;
});

beforeEach(() => knex.raw("truncate deals restart identity"));

after(() => knex.destroy());

test("a test deal's NOI, cap rate, DSCR and cash-on-cash match the hand calculation", () => {
  const analysis = analyzeDeal(DEAL);

  assert.deepEqual(
    [
      analysis.effective_gross_income_cents,
      analysis.operating_expenses_cents,
      analysis.noi_cents,
      analysis.monthly_debt_service_cents,
      analysis.cash_flow_cents,
      analysis.cash_invested_cents,
    ],
    [2850000, 795000, 2055000, 149693, 258684, 8500000],
  );
  assert.equal(analysis.cap_rate, 2055000 / 30000000);
  assert.equal(analysis.dscr, 2055000 / (149693 * 12));
  assert.equal(analysis.cash_on_cash, 258684 / 8500000);
});

test("a saved deal comes back with its numbers, and editing an assumption reworks them", async () => {
  const deal = await createDeal({ entityId, name: "Elm St duplex", inputs: DEAL });
  assert.equal(deal.analysis.noi_cents, 2055000);

  await editDeal(deal.deal_id, { inputs: { ...DEAL, monthlyRentCents: 260000 } });
  const [listed] = await listDeals(entityId);
  assert.equal(listed.analysis.gross_rent_cents, 3120000);
});
