import axios from "axios";

const BASE_URL = "http://localhost:3001";

// VANGUARD RETIREMENT
async function fetchVanguardRetirement() {
  const res = await axios.get(`${BASE_URL}/vanguardRetirement`);
  return res.data;
}
async function postVanguardRetirement(payload) {
  const res = await axios.post(`${BASE_URL}/vanguardRetirement`, payload);
  return res.data;
}
async function patchVanguardRetirement(payload) {
  const res = await axios.patch(`${BASE_URL}/vanguardRetirement`, payload);
  return res.data;
}
async function deleteVanguardRetirement(id) {
  const res = await axios.delete(`${BASE_URL}/vanguardRetirement`, { params: { id } });
  return res.data;
}

// TSP
async function fetchTsp() {
  const res = await axios.get(`${BASE_URL}/tsp`);
  return res.data;
}
async function postTsp(payload) {
  const res = await axios.post(`${BASE_URL}/tsp`, payload);
  return res.data;
}
async function patchTsp(payload) {
  const res = await axios.patch(`${BASE_URL}/tsp`, payload);
  return res.data;
}
async function deleteTsp(id) {
  const res = await axios.delete(`${BASE_URL}/tsp`, { params: { id } });
  return res.data;
}

// VANGUARD BROKERAGE
async function fetchVanguardBrokerage() {
  const res = await axios.get(`${BASE_URL}/vanguardBrokerage`);
  return res.data;
}
async function postVanguardBrokerage(payload) {
  const res = await axios.post(`${BASE_URL}/vanguardBrokerage`, payload);
  return res.data;
}
async function patchVanguardBrokerage(payload) {
  const res = await axios.patch(`${BASE_URL}/vanguardBrokerage`, payload);
  return res.data;
}
async function deleteVanguardBrokerage(id) {
  const res = await axios.delete(`${BASE_URL}/vanguardBrokerage`, { params: { id } });
  return res.data;
}

// PA529
async function fetchPa529() {
  const res = await axios.get(`${BASE_URL}/pa529`);
  return res.data;
}
async function postPa529(payload) {
  const res = await axios.post(`${BASE_URL}/pa529`, payload);
  return res.data;
}
async function patchPa529(payload) {
  const res = await axios.patch(`${BASE_URL}/pa529`, payload);
  return res.data;
}
async function deletePa529(id) {
  const res = await axios.delete(`${BASE_URL}/pa529`, { params: { id } });
  return res.data;
}

// CRYPTO
async function fetchCrypto() {
  const res = await axios.get(`${BASE_URL}/crypto`);
  return res.data;
}
async function postCrypto(payload) {
  const res = await axios.post(`${BASE_URL}/crypto`, payload);
  return res.data;
}
async function patchCrypto(payload) {
  const res = await axios.patch(`${BASE_URL}/crypto`, payload);
  return res.data;
}
async function deleteCrypto(id) {
  const res = await axios.delete(`${BASE_URL}/crypto`, { params: { id } });
  return res.data;
}
async function fetchCryptoMarketData(idTags) {
  const res = await axios.get(`${BASE_URL}/crypto-market`, {
    params: { idTags: idTags.join(",") },
  });
  return res.data;
}

// BASK
async function fetchBask() {
  const res = await axios.get(`${BASE_URL}/bask`);
  return res.data;
}
async function postBask(payload) {
  const res = await axios.post(`${BASE_URL}/bask`, payload);
  return res.data;
}
async function patchBask(payload) {
  const res = await axios.patch(`${BASE_URL}/bask`, payload);
  return res.data;
}
async function deleteBask(id) {
  const res = await axios.delete(`${BASE_URL}/bask`, { params: { id } });
  return res.data;
}

// LOANS
async function fetchLoans() {
  const res = await axios.get(`${BASE_URL}/loans`);
  return res.data;
}
async function postLoans(payload) {
  const res = await axios.post(`${BASE_URL}/loans`, payload);
  return res.data;
}
async function patchLoans(payload) {
  const res = await axios.patch(`${BASE_URL}/loans`, payload);
  return res.data;
}
async function deleteLoans(id) {
  const res = await axios.delete(`${BASE_URL}/loans`, { params: { id } });
  return res.data;
}

// EQUITY
async function fetchEquity() {
  const res = await axios.get(`${BASE_URL}/equity`);
  return res.data;
}
async function postEquity(payload) {
  const res = await axios.post(`${BASE_URL}/equity`, payload);
  return res.data;
}
async function patchEquity(payload) {
  const res = await axios.patch(`${BASE_URL}/equity`, payload);
  return res.data;
}
async function deleteEquity(id) {
  const res = await axios.delete(`${BASE_URL}/equity`, { params: { id } });
  return res.data;
}

// BUDGET (whole-month orchestration)
async function checkBudget(month, year) {
  const res = await axios.post(`${BASE_URL}/budget/check`, { month, year });
  return res.data;
}
async function postBudget(payload) {
  const res = await axios.post(`${BASE_URL}/budget`, payload);
  return res.data;
}
async function deleteBudget(month, year) {
  const res = await axios.delete(`${BASE_URL}/budget`, { params: { month, year } });
  return res.data;
}

// FIXED EXPENSES
async function fetchFixedExpenses() {
  const res = await axios.get(`${BASE_URL}/fixedExpenses`);
  return res.data;
}
async function postFixedExpense(payload) {
  const res = await axios.post(`${BASE_URL}/fixedExpenses`, payload);
  return res.data;
}
async function patchFixedExpense(payload) {
  const res = await axios.patch(`${BASE_URL}/fixedExpenses`, payload);
  return res.data;
}
async function deleteFixedExpense(category) {
  const res = await axios.delete(`${BASE_URL}/fixedExpenses`, { params: { category } });
  return res.data;
}

// FIXED INCOME
async function fetchFixedIncome() {
  const res = await axios.get(`${BASE_URL}/fixedIncome`);
  return res.data;
}
async function postFixedIncome(payload) {
  const res = await axios.post(`${BASE_URL}/fixedIncome`, payload);
  return res.data;
}
async function patchFixedIncome(payload) {
  const res = await axios.patch(`${BASE_URL}/fixedIncome`, payload);
  return res.data;
}
async function deleteFixedIncome(source) {
  const res = await axios.delete(`${BASE_URL}/fixedIncome`, { params: { source } });
  return res.data;
}

// MONTHLY INCOME
async function fetchMonthlyIncome(month, year) {
  const res = await axios.get(`${BASE_URL}/monthlyIncome`, { params: { month, year } });
  return res.data;
}
async function postMonthlyIncome(payload) {
  const res = await axios.post(`${BASE_URL}/monthlyIncome`, payload);
  return res.data;
}
async function deleteMonthlyIncome(id) {
  const res = await axios.delete(`${BASE_URL}/monthlyIncome`, { params: { id } });
  return res.data;
}

// MONTHLY EXPENSES / MONTHLY VARIED EXPENSES
async function fetchMonthlyFixedExpenses(month, year) {
  const res = await axios.get(`${BASE_URL}/monthlyExpenses`, {
    params: { month, year, type: "fixed expense" },
  });
  return res.data;
}
async function postMonthlyVariedExpense(payload) {
  const res = await axios.post(`${BASE_URL}/monthlyExpenses`, payload);
  return res.data;
}
async function fetchMonthlyVariedExpenses(month, year) {
  const res = await axios.get(`${BASE_URL}/monthlyVariedExpenses`, {
    params: { month, year, type: "varied expense" },
  });
  return res.data;
}
async function deleteMonthlyVariedExpense(id) {
  const res = await axios.delete(`${BASE_URL}/monthlyVariedExpenses`, { params: { id } });
  return res.data;
}

// BUDGET CATEGORIES
async function fetchCurrentBudgetCategories() {
  const res = await axios.get(`${BASE_URL}/currentBudgetCategories`);
  return res.data;
}
async function fetchBudgetCategories(month, year) {
  const res = await axios.get(`${BASE_URL}/budgetCategories`, { params: { month, year } });
  return res.data;
}
async function patchBudgetCategories(budgetRange) {
  const res = await axios.patch(`${BASE_URL}/budgetCategories`, { budgetRange });
  return res.data;
}
async function deleteBudgetCategory(id) {
  const res = await axios.delete(`${BASE_URL}/budgetCategories`, { params: { id } });
  return res.data;
}
async function postBudgetCategory(category, range) {
  const res = await axios.post(`${BASE_URL}/budgetCategories`, { category, range });
  return res.data;
}

// MONTH END DISTRIBUTIONS
async function fetchMonthEndDistributions(month, year) {
  const res = await axios.get(`${BASE_URL}/monthEndDistributions`, { params: { month, year } });
  return res.data;
}
async function postMonthEndDistribution(payload) {
  const res = await axios.post(`${BASE_URL}/monthEndDistributions`, payload);
  return res.data;
}
async function deleteMonthEndDistribution(id) {
  const res = await axios.delete(`${BASE_URL}/monthEndDistributions`, { params: { id } });
  return res.data;
}

// NOTES
async function fetchNotes(month, year) {
  const res = await axios.get(`${BASE_URL}/notes`, { params: { month, year } });
  return res.data;
}
async function postNote(payload) {
  const res = await axios.post(`${BASE_URL}/notes`, payload);
  return res.data;
}
async function deleteNote(id) {
  const res = await axios.delete(`${BASE_URL}/notes`, { params: { id } });
  return res.data;
}
async function exportCSV(month, year, isExported) {
  const res = await axios.get(`${BASE_URL}/exportCSV`, { params: { month, year, isExported } });
  return res.data;
}

// REPORTS
async function fetchReportData(startDateString, endDateString, formattedCategories) {
  const res = await axios.get(`${BASE_URL}/reportData`, {
    params: { startDateString, endDateString, formattedCategories },
  });
  return res.data;
}
async function fetchReportDataTotal(startDateString, endDateString) {
  const res = await axios.get(`${BASE_URL}/reportData`, {
    params: { startDateString, endDateString, reason: "total" },
  });
  return res.data;
}
async function fetchReportDataWarningsAndLimits(startDateString, endDateString, formattedCategories) {
  const res = await axios.get(`${BASE_URL}/reportData`, {
    params: { startDateString, endDateString, formattedCategories, reason: "warningsAndLimits" },
  });
  return res.data;
}

export {
  fetchVanguardRetirement, postVanguardRetirement, patchVanguardRetirement, deleteVanguardRetirement,
  fetchTsp, postTsp, patchTsp, deleteTsp,
  fetchVanguardBrokerage, postVanguardBrokerage, patchVanguardBrokerage, deleteVanguardBrokerage,
  fetchPa529, postPa529, patchPa529, deletePa529,
  fetchCrypto, postCrypto, patchCrypto, deleteCrypto, fetchCryptoMarketData,
  fetchBask, postBask, patchBask, deleteBask,
  fetchLoans, postLoans, patchLoans, deleteLoans,
  fetchEquity, postEquity, patchEquity, deleteEquity,
  checkBudget, postBudget, deleteBudget,
  fetchFixedExpenses, postFixedExpense, patchFixedExpense, deleteFixedExpense,
  fetchFixedIncome, postFixedIncome, patchFixedIncome, deleteFixedIncome,
  fetchMonthlyIncome, postMonthlyIncome, deleteMonthlyIncome,
  fetchMonthlyFixedExpenses, postMonthlyVariedExpense, fetchMonthlyVariedExpenses, deleteMonthlyVariedExpense,
  fetchCurrentBudgetCategories, fetchBudgetCategories, patchBudgetCategories, deleteBudgetCategory, postBudgetCategory,
  fetchMonthEndDistributions, postMonthEndDistribution, deleteMonthEndDistribution,
  fetchNotes, postNote, deleteNote, exportCSV,
  fetchReportData, fetchReportDataTotal, fetchReportDataWarningsAndLimits,
};
