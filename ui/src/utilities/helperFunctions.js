import { createSelector } from "@reduxjs/toolkit";

const sumBy = (items, key) =>
  items.reduce((total, item) => total + (Number(item[key]) || 0), 0);

// Replaces the old pattern of every investment/loan component computing its
// own total locally and pushing it up into AppContext via
// useEffect(() => setXTotal(...)). Home.js no longer needs to force-mount
// every domain component (the old "hidden-container" trick) just to
// populate these - it dispatches each domain's load thunk directly instead.

const selectVanguardRetirementTotal = (state) => sumBy(state.vanguardRetirement.items, "value");
const selectTspTotal = (state) => sumBy(state.tsp.items, "value");
const selectVanguardBrokerageTotal = (state) => sumBy(state.vanguardBrokerage.items, "value");
const selectPa529Total = (state) => sumBy(state.pa529.items, "value");
const selectCryptoTotal = (state) => sumBy(state.crypto.items, "value");
const selectBaskTotal = (state) => sumBy(state.bask.items, "value");
const selectHouseValuationTotal = (state) => sumBy(state.equity.items, "valuation");
const selectEquityTotal = (state) => sumBy(state.equity.items, "equity");

const selectMortgageTotal = (state) =>
  sumBy(state.loans.items.filter((row) => row.type === "Mortgage"), "remainingBalance");
const selectStudentLoanTotal = (state) =>
  sumBy(state.loans.items.filter((row) => row.type === "Student Loan"), "remainingBalance");
const selectAutoLoanTotal = (state) =>
  sumBy(state.loans.items.filter((row) => row.type === "Auto Loan"), "remainingBalance");

// Mirrors HomeSummary.js's investmentSummary/loanSummary donut inputs.
const selectInvestmentTotals = createSelector(
  [
    selectVanguardRetirementTotal,
    selectTspTotal,
    selectVanguardBrokerageTotal,
    selectPa529Total,
    selectCryptoTotal,
    selectBaskTotal,
    selectHouseValuationTotal,
  ],
  (vanguardRetirementTotal, tspTotal, vanguardBrokerageTotal, pa529Total, cryptoTotal, baskTotal, houseValuationTotal) => ({
    vanguardRetirementTotal,
    tspTotal,
    vanguardBrokerageTotal,
    pa529Total,
    cryptoTotal,
    baskTotal,
    houseValuationTotal,
    investmentSummary: {
      retirement: vanguardRetirementTotal + tspTotal,
      brokerage: vanguardBrokerageTotal,
      college: pa529Total,
      cryptoTotal,
      emergency: baskTotal,
      house: houseValuationTotal,
    },
  })
);

const selectLoanTotals = createSelector(
  [selectMortgageTotal, selectStudentLoanTotal, selectAutoLoanTotal, selectEquityTotal],
  (mortgageTotal, studentLoanTotal, autoLoanTotal, equityTotal) => ({
    mortgageTotal,
    studentLoanTotal,
    autoLoanTotal,
    equityTotal,
    loanSummary: {
      mortgage: mortgageTotal,
      studentLoan: studentLoanTotal,
      auto: autoLoanTotal,
    },
  })
);

// Mirrors Budget.js's getBalance() effect.
const selectBudgetBalance = createSelector(
  [
    (state) => state.monthlyExpenses.variedExpenses,
    (state) => state.monthlyExpenses.fixedExpenses,
    (state) => state.monthlyIncome.items,
    (state) => state.fixedIncome.items,
    (state) => state.fixedExpenses.items,
    (state) => state.monthEndDistributions.items,
  ],
  (variedExpenses, monthlyFixedExpenses, monthlyIncome, fixedIncome, fixedExpenses, monthEndDistributions) => {
    const totalSpent = parseFloat(sumBy(variedExpenses, "amount").toFixed(2));
    const totalIncome = parseFloat(sumBy(monthlyIncome, "amount").toFixed(2));
    const totalFixedIncome = parseFloat(sumBy(fixedIncome, "amount").toFixed(2));
    const totalDistributions = parseFloat(sumBy(monthEndDistributions, "amount").toFixed(2));
    const totalFixedExpenses = parseFloat(sumBy(fixedExpenses, "amount").toFixed(2));
    const totalMonthlyFixedExpenses = parseFloat(sumBy(monthlyFixedExpenses, "amount").toFixed(2));

    const remainingBalance = parseFloat(
      (totalIncome - totalMonthlyFixedExpenses - totalSpent - totalDistributions).toFixed(2)
    );
    const remainingDonut = remainingBalance < 0 ? 0 : remainingBalance;

    return {
      totalSpent,
      totalIncome,
      totalFixedIncome,
      totalDistributions,
      totalFixedExpenses,
      totalMonthlyFixedExpenses,
      remainingBalance,
      budgetSummary: {
        variable: totalSpent,
        fixed: totalMonthlyFixedExpenses,
        distributions: totalDistributions,
        remaining: remainingDonut,
      },
    };
  }
);

// Mirrors Budget.js's budgetCompare effect (per-category warning/limit check).
const selectBudgetComparison = createSelector(
  [
    (state) => state.budgetCategories.snapshotCategories,
    (state) => state.monthlyExpenses.variedExpenses,
  ],
  (snapshotCategories, variedExpenses) => {
    const displayCategories = Array.from(
      new Set(snapshotCategories.map((cat) => cat.category))
    );

    return displayCategories.map((category) => {
      const subtotal = variedExpenses.reduce((prevAmount, expense) => {
        return expense.category === category ? expense.amount + prevAmount : prevAmount;
      }, 0);

      const entry = { category, subtotal, warning: false, limit: false };
      for (const cat of snapshotCategories) {
        if (category === cat.category) {
          entry.warningAmount = cat.warning;
          entry.limitAmount = cat.limit;
          if (subtotal > cat.warning) {
            entry.warning = true;
            if (subtotal > cat.limit) {
              entry.limit = true;
            }
          }
          break;
        }
      }
      return entry;
    });
  }
);

// Mirrors Home.js's Net Worth card math (and the server's
// netWorthController.computeNetWorth) - the single place the live
// assets/liabilities/net worth totals are derived.
const selectNetWorthTotals = createSelector(
  [selectInvestmentTotals, selectLoanTotals],
  (investments, loans) => {
    // Keys match netWorthSlice's snapshot fields / netWorthCategories.js
    const breakdown = {
      retirement: investments.vanguardRetirementTotal + investments.tspTotal,
      brokerage: investments.vanguardBrokerageTotal,
      college: investments.pa529Total,
      crypto: investments.cryptoTotal,
      emergency: investments.baskTotal,
      house: investments.houseValuationTotal,
      mortgage: loans.mortgageTotal,
      studentLoan: loans.studentLoanTotal,
      autoLoan: loans.autoLoanTotal,
    };
    const totalAssets =
      breakdown.retirement +
      breakdown.brokerage +
      breakdown.college +
      breakdown.crypto +
      breakdown.emergency +
      breakdown.house;
    const totalLiabilities = breakdown.mortgage + breakdown.studentLoan + breakdown.autoLoan;
    return { breakdown, totalAssets, totalLiabilities, netWorth: totalAssets - totalLiabilities };
  }
);

// Given ascending snapshots (YYYY-MM-DD dates) and a current net worth,
// returns how much it moved vs. a few reference points. Each entry is
// null when there's no snapshot old enough to compare against yet.
const getNetWorthChanges = (snapshots, currentNetWorth, today = new Date()) => {
  const pad = (n) => String(n).padStart(2, "0");
  const monthStart = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-01`;
  const yearStart = `${today.getFullYear()}-01-01`;

  const lastBefore = (date) => {
    for (let i = snapshots.length - 1; i >= 0; i--) {
      if (snapshots[i].date < date) return snapshots[i];
    }
    return null;
  };
  const diff = (snapshot) =>
    snapshot
      ? {
          amount: currentNetWorth - snapshot.netWorth,
          percent: snapshot.netWorth ? ((currentNetWorth - snapshot.netWorth) / Math.abs(snapshot.netWorth)) * 100 : null,
          since: snapshot.date,
          baseline: snapshot,
        }
      : null;

  // YTD compares against the last snapshot of last year; until there is
  // one (tracking only just started), fall back to the first one this year.
  const ytdBase = lastBefore(yearStart) || snapshots.find((s) => s.date >= yearStart) || null;

  return {
    sinceLastMonth: diff(lastBefore(monthStart)),
    yearToDate: diff(ytdBase),
    allTime: diff(snapshots[0] || null),
  };
};

export {
  selectInvestmentTotals,
  selectLoanTotals,
  selectBudgetBalance,
  selectBudgetComparison,
  selectNetWorthTotals,
  getNetWorthChanges,
};
