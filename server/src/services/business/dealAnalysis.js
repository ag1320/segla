import { monthlyPaymentCents } from "./amortization.js";

// A deal's yearly numbers and ratios, from its assumptions. Amounts are
// cents; percents are plain numbers (5 means 5%).
// inputs: { purchasePriceCents, closingCostsCents, rehabCents, downPaymentPercent,
//   interestRatePercent, termYears, monthlyRentCents, otherMonthlyIncomeCents,
//   vacancyPercent, propertyTaxCents, insuranceCents, repairsPercent, capexPercent,
//   managementPercent, utilitiesMonthlyCents, hoaMonthlyCents, otherExpensesCents }
// Repairs, capex and management are shares of income after vacancy, the
// way property managers charge and reserves are usually set.
function analyzeDeal(inputs) {
  const percent = (value) => value / 100;

  const grossRentCents = (inputs.monthlyRentCents + inputs.otherMonthlyIncomeCents) * 12;
  const vacancyCents = Math.round(grossRentCents * percent(inputs.vacancyPercent));
  const effectiveGrossIncomeCents = grossRentCents - vacancyCents;
  const shareOfIncome = (value) => Math.round(effectiveGrossIncomeCents * percent(value));
  const operatingExpensesCents =
    inputs.propertyTaxCents +
    inputs.insuranceCents +
    shareOfIncome(inputs.repairsPercent) +
    shareOfIncome(inputs.capexPercent) +
    shareOfIncome(inputs.managementPercent) +
    (inputs.utilitiesMonthlyCents + inputs.hoaMonthlyCents) * 12 +
    inputs.otherExpensesCents;
  const noiCents = effectiveGrossIncomeCents - operatingExpensesCents;

  const downPaymentCents = Math.round(inputs.purchasePriceCents * percent(inputs.downPaymentPercent));
  const loanCents = inputs.purchasePriceCents - downPaymentCents;
  const monthlyDebtServiceCents =
    loanCents > 0
      ? monthlyPaymentCents({
          principalCents: loanCents,
          annualRatePercent: inputs.interestRatePercent,
          termMonths: inputs.termYears * 12,
        })
      : 0;
  const debtServiceCents = monthlyDebtServiceCents * 12;
  const cashFlowCents = noiCents - debtServiceCents;
  const cashInvestedCents = downPaymentCents + inputs.closingCostsCents + inputs.rehabCents;
  const ratio = (numerator, denominator) => (denominator > 0 ? numerator / denominator : null);

  return {
    gross_rent_cents: grossRentCents,
    vacancy_cents: vacancyCents,
    effective_gross_income_cents: effectiveGrossIncomeCents,
    operating_expenses_cents: operatingExpensesCents,
    noi_cents: noiCents,
    down_payment_cents: downPaymentCents,
    loan_cents: loanCents,
    monthly_debt_service_cents: monthlyDebtServiceCents,
    debt_service_cents: debtServiceCents,
    cash_flow_cents: cashFlowCents,
    monthly_cash_flow_cents: Math.round(cashFlowCents / 12),
    cash_invested_cents: cashInvestedCents,
    cap_rate: ratio(noiCents, inputs.purchasePriceCents),
    cash_on_cash: ratio(cashFlowCents, cashInvestedCents),
    dscr: ratio(noiCents, debtServiceCents),
    // Quick screens: monthly rent ÷ price (the "1% rule") and price ÷
    // yearly rent (gross rent multiplier).
    rent_to_price: ratio(inputs.monthlyRentCents, inputs.purchasePriceCents),
    gross_rent_multiplier: ratio(inputs.purchasePriceCents, grossRentCents),
    // Share of income that expenses and the mortgage eat; above 1 loses money.
    break_even_ratio: ratio(operatingExpensesCents + debtServiceCents, grossRentCents),
  };
}

export { analyzeDeal };
