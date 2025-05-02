require('dotenv').config({ path: '../../.env' });
const knex = require("./dbConnection");
const axios = require("axios").default;
const fastcsv = require("fast-csv");
const fs = require("fs");


/*
**********************************************
              INVESTMENTS OLD
**********************************************
*/
function insertTransaction(body, owner, id) {
  let { date, price, shares, order, comment, asset } = body;
  if (asset === "Crypto") {
    return knex("transactions")
      .insert({
        date,
        price,
        shares,
        order,
        comment,
        owner,
        crypto_id: id,
      })
      .then((data) => data);
  } else {
    return knex("transactions")
      .insert({
        date,
        price,
        shares,
        order,
        comment,
        owner,
        traditional_id: id,
      })
      .then((data) => data);
  }
}

function getTickers(body) {
  let ticker = body.ticker;
  let table = "";
  body.asset === "Crypto" ? (table = "crypto") : (table = "traditional");
  return knex(table)
    .select("*")
    .where({ ticker })
    .then((data) => data);
}

function insertTicker(body) {
  let { ticker, shares, asset, detailedAsset, expenseRatio } = body;
  if (asset === "Crypto") {
    return knex("crypto")
      .insert({
        ticker,
        asset,
        totalShares: shares,
      })
      .returning("crypto_id")
      .then((data) => data);
  } else {
    return knex("traditional")
      .insert({
        ticker,
        totalShares: shares,
        asset,
        detailedAsset,
        expenseRatio,
      })
      .returning("traditional_id")
      .then((data) => data);
  }
}

function getTradTransactions(owner) {
  return knex("transactions")
    .join("traditional", {
      "transactions.traditional_id": "traditional.traditional_id",
    })
    .select("*")
    .where({ owner })
    .then((data) => data);
}

function getCryptoTransactions(owner) {
  return knex("transactions")
    .join("crypto", {
      "transactions.crypto_id": "crypto.crypto_id",
    })
    .select("*")
    .where({ owner })
    .then((data) => data);
}

function splitTickers(array) {
  let result = [];
  while (array.length) {
    result.push(array.splice(0, 10));
  }
  return result;
}

function updatePrice(symbol, regularMarketPrice, shortName, quoteType) {
  let ticker = symbol;
  if (quoteType === "CRYPTOCURRENCY") {
    return knex("crypto")
      .update({
        marketPrice: regularMarketPrice,
        name: shortName,
        detailedAsset: shortName,
      })
      .where({ ticker })
      .then((data) => data);
  } else {
    return knex("traditional")
      .update({ marketPrice: regularMarketPrice, name: shortName })
      .where({ ticker })
      .then((data) => data);
  }
}

function getShares(symbol, quoteType) {
  let ticker = symbol;
  if (quoteType === "CRYPTOCURRENCY") {
    return knex("crypto")
      .select("totalShares")
      .where({ ticker })
      .then((data) => data);
  } else {
    return knex("traditional")
      .select("totalShares", "expenseRatio")
      .where({ ticker })
      .then((data) => data);
  }
}

function deleteTransactions(id, asset, owner) {
  if (asset === "Crypto") {
    return knex("transactions")
      .del("*")
      .where({ crypto_id: id, owner })
      .then((data) => data);
  } else {
    return knex("transactions")
      .del("*")
      .where({ traditional_id: id, owner })
      .then((data) => data);
  }
}

function deleteTicker(id, asset) {
  if (asset === "Crypto") {
    return knex("crypto")
      .del("*")
      .where({ crypto_id: id })
      .then((data) => data);
  } else {
    return knex("traditional")
      .del("*")
      .where({ traditional_id: id })
      .then((data) => data);
  }
}

function patchShares(id, asset, shares) {
  if (asset === "Crypto") {
    return knex("crypto")
      .update({ totalShares: shares })
      .where({ crypto_id: id })
      .then((data) => data);
  } else {
    return knex("traditional")
      .update({ totalShares: shares })
      .where({ traditional_id: id })
      .then((data) => data);
  }
}

/*
**********************************************
              INVESTMENTS NEW
**********************************************
*/

const fetchData = () =>{
  return
}

function getVanguardRetirement() {
  return knex("vanguard_retirement")
    .select("*")
    .then((data) => data);
}

function postVanguardRetirement(account_holder, account_type, current_value) {
  return knex("vanguard_retirement")
    .insert({
      account_holder,
      account_type,
      current_value,
    })
    .then((data) => data);
}

function deleteVanguardRetirement(vanguard_account_id) {
  return knex("vanguard_retirement")
    .del("*")
    .where({ vanguard_account_id })
    .then((data) => data);
}

function patchVanguardRetirement(
  account_holder,
  account_type,
  current_value,
  total_return,
  total_return_percentage,
  ytd_return_percentage,
  vanguard_account_id
) {
  console.log(
    "payload",
    account_holder,
    account_type,
    current_value,
    total_return,
    total_return_percentage,
    ytd_return_percentage,
    vanguard_account_id
  );
  return knex("vanguard_retirement")
    .update({
      account_holder,
      account_type,
      current_value,
      total_return,
      total_return_percentage,
      ytd_return_percentage,
    })
    .where({ vanguard_account_id })
    .then((data) => data);
}

function getVanguardBrokerage() {
  return knex("vanguard_brokerage")
    .select("*")
    .then((data) => data);
}

function postVanguardBrokerage(account_holder, account_type, current_value) {
  return knex("vanguard_brokerage")
    .insert({
      account_holder,
      account_type,
      current_value,
    })
    .then((data) => data);
}

function deleteVanguardBrokerage(vanguard_account_id) {
  return knex("vanguard_brokerage")
    .del("*")
    .where({ vanguard_account_id })
    .then((data) => data);
}

function patchVanguardBrokerage(
  account_holder,
  account_type,
  current_value,
  total_return,
  total_return_percentage,
  ytd_return_percentage,
  vanguard_account_id
) {
  return knex("vanguard_brokerage")
    .update({
      account_holder,
      account_type,
      current_value,
      total_return,
      total_return_percentage,
      ytd_return_percentage,
    })
    .where({ vanguard_account_id })
    .then((data) => data);
}

function getTsp() {
  return knex("tsp")
    .select("*")
    .then((data) => data);
}

function postTsp(
  account_holder,
  account_type,
  current_value,
  total_return,
  my_contribution,
  govt_contribution,
  ytd_return_percentage
) {
  return knex("tsp")
    .insert({
      account_holder,
      account_type,
      current_value,
      total_return,
      my_contribution,
      govt_contribution,
      ytd_return_percentage,
    })
    .then((data) => data);
}

function deleteTsp(vanguard_account_id) {
  return knex("tsp")
    .del("*")
    .where({ tsp_account_id })
    .then((data) => data);
}

function patchTsp(
  account_holder,
  account_type,
  current_value,
  total_return,
  my_contribution,
  govt_contribution,
  ytd_return_percentage,
  tsp_account_id
) {
  return knex("tsp")
    .update({
      account_holder,
      account_type,
      current_value,
      total_return,
      my_contribution,
      govt_contribution,
      ytd_return_percentage,
    })
    .where({ tsp_account_id })
    .then((data) => data);
}

function getPa529() {
  return knex("pa529")
    .select("*")
    .then((data) => data);
}

function postPa529(
  beneficiary,
  current_value,
  total_return,
  projected_college_year
) {
  return knex("pa529")
    .insert({
      beneficiary,
      current_value,
      total_return,
      projected_college_year,
    })
    .then((data) => data);
}

function deletePa529(pa529_account_id) {
  return knex("pa529")
    .del("*")
    .where({ pa529_account_id })
    .then((data) => data);
}

function patchPa529(
  beneficiary,
  current_value,
  total_return,
  projected_college_year,
  pa529_account_id
) {
  return knex("pa529")
    .update({
      beneficiary,
      current_value,
      total_return,
      projected_college_year,
    })
    .where({ pa529_account_id })
    .then((data) => data);
}

function getCrypto() {
  return knex("cryptocurrency")
    .select("*")
    .then((data) => data);
}

function postCrypto(ticker, name, url, shares, total_spent) {
  return knex("cryptocurrency")
    .insert({
      ticker,
      name,
      url,
      shares,
      total_spent,
    })
    .then((data) => data);
}

function deleteCrypto(crypto_id) {
  return knex("cryptocurrency")
    .del("*")
    .where({ crypto_id })
    .then((data) => data);
}

function patchCrypto(
  ticker,
  name,
  url,
  shares,
  total_spent,
  crypto_id
) {
  return knex("cryptocurrency")
    .update({
      ticker,
      name,
      url,
      shares,
      total_spent,
    })
    .where({ crypto_id })
    .then((data) => data);
}

function getBask() {
  return knex("bask")
    .select("*")
    .then((data) => data);
}

function postBask(interest_rate, current_value, total_return, ytd_return) {
  return knex("bask")
    .insert({
      interest_rate,
      current_value,
      total_return,
      ytd_return,
    })
    .then((data) => data);
}

function deleteBask(bask_id) {
  return knex("bask")
    .del("*")
    .where({ bask_id })
    .then((data) => data);
}

function patchBask(
  interest_rate,
  current_value,
  total_return,
  ytd_return,
  bask_account_id
) {
  return knex("bask")
    .update({
      interest_rate,
      current_value,
      total_return,
      ytd_return,
    })
    .where({ bask_account_id })
    .then((data) => data);
}

function getLoans() {
  return knex("loans")
    .select("*")
    .then((data) => data);
}

function postLoans(
  url,
  account_holder,
  interest_rate,
  payoff_date,
  monthly_payment,
  remaining_balance,
  type
) {
  return knex("loans")
    .insert({
      url,
      account_holder,
      interest_rate,
      payoff_date,
      monthly_payment,
      remaining_balance,
      type,
    })
    .then((data) => data);
}

function deleteLoans(loan_account_id) {
  return knex("loans")
    .del("*")
    .where({ loan_account_id })
    .then((data) => data);
}

function patchLoans(
  url,
  account_holder,
  interest_rate,
  payoff_date,
  monthly_payment,
  remaining_balance,
  loan_account_id
) {
  return knex("loans")
    .update({
      url,
      account_holder,
      interest_rate,
      payoff_date,
      monthly_payment,
      remaining_balance,
    })
    .where({ loan_account_id })
    .then((data) => data);
}

function getEquity() {
  return knex("equity")
    .select("*")
    .then((data) => data);
}

function postEquity(address, valuation, remaining_balance) {
  return knex("equity")
    .insert({
      address,
      valuation,
      remaining_balance,
    })
    .then((data) => data);
}

function deleteEquity(equity_id) {
  return knex("equity")
    .del("*")
    .where({ equity_id })
    .then((data) => data);
}

function patchEquity(address, valuation, remaining_balance, equity_id) {
  return knex("equity")
    .update({
      address,
      valuation,
      remaining_balance,
    })
    .where({ equity_id })
    .then((data) => data);
}

function fetchCryptoMarketData(idTags) {
  let url = 'https://api.coingecko.com/api/v3/simple/price?'
  url = url + 'ids='+idTags
  url = url + '&vs_currencies=usd'
  let apiKey = process.env.COIN_GECKO_API_KEY
  console.log("url", url)
  let options = {
    method: "GET",
    url,
    headers: {
      "x-cg-demo-api-key": apiKey,
    },
  };

  return axios
  .request(options)
  .then((data) =>data)
  .catch((err) => err);
}

/*
**********************************************
                   BUDGET
**********************************************
*/

function checkBudget(month, year) {
  return knex("monthly_expenses")
    .select("*")
    .where({ month })
    .andWhere({ year })
    .then((data) => data);
}

function getFixedExpenses() {
  return knex("fixed_expenses")
    .select("*")
    .then((data) => data);
}

function getFixedIncome() {
  return knex("income")
    .select("*")
    .then((data) => data);
}

function postIncome(income, month, year) {
  let category = income.name;
  let type = "income";
  let amount = income.amount;
  return knex("monthly_expenses")
    .insert({
      category,
      type,
      amount,
      month,
      year,
    })
    .then((data) => data);
}

function postFixedExpense(expense, month, year) {
  let category = expense.name + " - " + expense.owner;
  let type = "fixed expense";
  let amount = expense.amount;
  return knex("monthly_expenses")
    .insert({
      category,
      type,
      amount,
      month,
      year,
    })
    .then((data) => data);
}

function editFixedExpenseAaron(category, oldCategory, aaron) {
  let name = category;
  let owner = "Aaron";
  let amount = aaron;
  return knex("fixed_expenses")
    .update({
      name,
      amount,
    })
    .where({ name: oldCategory, owner })
    .then((data) => data);
}

function editFixedExpenseJen(category, oldCategory, jen) {
  let name = category;
  let owner = "Jen";
  let amount = jen;
  return knex("fixed_expenses")
    .update({
      name,
      amount,
    })
    .where({ name: oldCategory, owner })
    .then((data) => data);
}

function deleteFixedExpense(category) {
  let name = category;
  return knex("fixed_expenses")
    .delete()
    .where({ name })
    .then((data) => data);
}

function insertFixedExpense(category, aaron, jen) {
  let name = category;
  return knex("fixed_expenses")
    .insert([
      { name, owner: "Aaron", amount: aaron },
      { name, owner: "Jen", amount: jen },
    ])
    .then((data) => data);
}

function editFixedIncome(source, income_id, amount) {
  let name = source;
  return knex("income")
    .update({
      name,
      amount,
    })
    .where({ income_id })
    .then((data) => data);
}

function deleteFixedIncome(source) {
  let name = source;
  return knex("income")
    .delete()
    .where({ name })
    .then((data) => data);
}

function insertFixedIncome(source, amount) {
  let name = source;
  return knex("income")
    .insert({ name, amount })
    .then((data) => data);
}

function getMonthlyIncome(month, year) {
  return knex("monthly_expenses")
    .select("*")
    .where({ type: "income", month, year })
    .then((data) => data);
}

function getMonthlyExpenses(month, year, type) {
  return knex("monthly_expenses")
    .select("*")
    .where({ type, month, year })
    .then((data) => data);
}

function getMonthlyVariedExpenses(month, year, type) {
  return knex("monthly_expenses")
    .join("budget_categories_snapshot", {
      "monthly_expenses.category_id":
        "budget_categories_snapshot.budget_categories_snapshot_id",
    })
    .select("*")
    .where({
      type,
      "monthly_expenses.month": month,
      "monthly_expenses.year": year,
    })
    .then((data) => data);
}

function deleteMonthlyExpenses(month, year) {
  return knex("monthly_expenses")
    .del("*")
    .where({ month, year })
    .then((data) => data);
}

function deleteBudgetCategories(month, year) {
  return knex("budget_categories_snapshot")
    .del("*")
    .where({ month, year })
    .then((data) => data);
}

function deleteMonthlyVariedExpenses(monthly_expenses_id) {
  return knex("monthly_expenses")
    .del("*")
    .where({ monthly_expenses_id })
    .then((data) => data);
}

function getCurrentBudgetCategories() {
  return knex("budget_categories")
    .select("*")
    .then((data) => data);
}

function getCategoryId(category, subcategory, month, year) {
  if (subcategory === "") {
    subcategory = null;
  }
  return knex("budget_categories_snapshot")
    .select("budget_categories_snapshot_id")
    .where({ category, subcategory, month, year })
    .then((data) => data[0].budget_categories_snapshot_id);
}

function insertVariedExpense(category_id, amount, month, year) {
  let type = "varied expense";
  return knex("monthly_expenses")
    .insert({ category_id, type, amount, month, year })
    .then((data) => data);
}

function postBudgetCategories(budgetCategory, month, year) {
  let category = budgetCategory.category;
  let subcategory = budgetCategory.subcategory;
  let limit = budgetCategory.limit;
  let warning = budgetCategory.warning;
  return knex("budget_categories_snapshot")
    .insert({
      category,
      subcategory,
      limit,
      warning,
      month,
      year,
    })
    .then((data) => data);
}

function getBudgetCategories(month, year) {
  return knex("budget_categories_snapshot")
    .select("*")
    .where({ month, year })
    .then((data) => data);
}

function patchBudgetCategory(budget) {
  let category = budget.category;
  let limit = budget.range[1];
  let warning = budget.range[0];
  return knex("budget_categories")
    .update({
      limit,
      warning,
    })
    .where({ category })
    .then((data) => data);
}

function deleteBudgetCategory(budget_categories_id) {
  return knex("budget_categories")
    .del("*")
    .where({ budget_categories_id })
    .then((data) => data);
}

function postBudgetCategory(category, range) {
  let warning = range[0];
  let limit = range[1];
  return knex("budget_categories")
    .insert({ category, warning, limit })
    .then((data) => data);
}

function getMonthEndDistributions(month, year) {
  let type = "month end distribution";
  return knex("monthly_expenses")
    .select("*")
    .where({ month, year, type })
    .then((data) => data);
}

function postMonthEndDistribution(category, amount, month, year) {
  let type = "month end distribution";
  return knex("monthly_expenses")
    .insert({ category, amount, type, month, year })
    .then((data) => data);
}

function deleteMonthEndDistribution(monthly_expenses_id) {
  return knex("monthly_expenses")
    .del("*")
    .where({ monthly_expenses_id })
    .then((data) => data);
}

function deleteMonthlyIncome(monthly_expenses_id) {
  return knex("monthly_expenses")
    .del("*")
    .where({ monthly_expenses_id })
    .then((data) => data);
}

function postMonthlyIncome(category, amount, month, year) {
  let type = "income";
  return knex("monthly_expenses")
    .insert({ category, amount, type, month, year })
    .then((data) => data);
}

function exportCSV(month, year) {
  let fileName = `Budget-${month}-${year}.csv`;
  const ws = fs.createWriteStream(`/var/Users/aaron/${fileName}`);
  return knex("monthly_expenses")
    .select("*")
    .where({ month, year })
    .then((data) => {
      const jsonData = JSON.parse(JSON.stringify(data));
      fastcsv
        .write(jsonData, { headers: true })

        .on("finish", function () {
          console.log(`Postgres table exported to CSV file successfully.`);
        })

        .pipe(ws);
    });
}

function postNote(title, details, month, year) {
  return knex("notes")
    .insert({ title, details, month, year })
    .then((data) => data);
}

function getNotes(month, year) {
  return knex("notes")
    .select("*")
    .where({ month, year })
    .then((data) => data);
}

function deleteNote(note_id) {
  return knex("notes")
    .del("*")
    .where({ note_id })
    .then((data) => data);
}

function deleteNotes(month, year) {
  return knex("notes")
    .del("*")
    .where({ month, year })
    .then((data) => data);
}

function findError(response, input) {
  let errorTickers = [];
  for (let ticker of input) {
    if (response.filter((e) => e.symbol === ticker).length === 0) {
      errorTickers.push(ticker);
    }
  }
  return errorTickers;
}

function getReportData(startDateString, endDateString, formattedCategories) {
  const categories = formattedCategories.map((cat) => JSON.parse(cat));
  const mainCategories = categories
    .filter(cat => cat.category !== "Utilities")
    .map(cat => cat.category);
  const subcategories = categories
    .filter(cat => cat.subcategory !== null)
    .map(cat => cat.subcategory);

  console.log(mainCategories);
  console.log(subcategories);

  return knex("monthly_expenses")
    .join("budget_categories_snapshot", function () {
      this.on(
        "monthly_expenses.category_id",
        "=",
        "budget_categories_snapshot.budget_categories_snapshot_id"
      );
    })
    .select(
      "monthly_expenses.amount",
      "monthly_expenses.month",
      "monthly_expenses.year",
      "budget_categories_snapshot.category",
      "budget_categories_snapshot.subcategory"
    )
    .whereBetween(
      knex.raw("TO_DATE(CONCAT(monthly_expenses.month, ' ', monthly_expenses.year), 'Month YYYY')"),
      [startDateString, endDateString]
    )
    .where(function () {
      this.whereIn("budget_categories_snapshot.category", mainCategories)
        .orWhereIn("budget_categories_snapshot.subcategory", subcategories);
    })
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error('Error executing query:', error);
      throw error;
    });
}

function getReportDataTotal(startDateString, endDateString) {

  return knex("monthly_expenses")
    .select(
      "monthly_expenses.amount",
      "monthly_expenses.month",
      "monthly_expenses.year",
      "monthly_expenses.type",
    )
    .whereBetween(
      knex.raw("TO_DATE(CONCAT(monthly_expenses.month, ' ', monthly_expenses.year), 'Month YYYY')"),
      [startDateString, endDateString]
    )
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error('Error executing query:', error);
      throw error;
    });
}



module.exports = {
  insertTransaction,
  getTickers,
  insertTicker,
  getTradTransactions,
  getCryptoTransactions,
  fetchData,
  splitTickers,
  updatePrice,
  getShares,
  checkBudget,
  getFixedExpenses,
  getFixedIncome,
  postIncome,
  postFixedExpense,
  editFixedExpenseAaron,
  editFixedExpenseJen,
  deleteFixedExpense,
  insertFixedExpense,
  editFixedIncome,
  deleteFixedIncome,
  insertFixedIncome,
  getMonthlyIncome,
  getMonthlyExpenses,
  deleteMonthlyExpenses,
  getCurrentBudgetCategories,
  getCategoryId,
  insertVariedExpense,
  getMonthlyVariedExpenses,
  deleteMonthlyVariedExpenses,
  postBudgetCategories,
  getBudgetCategories,
  deleteBudgetCategories,
  patchBudgetCategory,
  deleteBudgetCategory,
  postBudgetCategory,
  getMonthEndDistributions,
  postMonthEndDistribution,
  deleteMonthEndDistribution,
  deleteMonthlyIncome,
  postMonthlyIncome,
  exportCSV,
  postNote,
  getNotes,
  deleteNote,
  deleteNotes,
  findError,
  deleteTransactions,
  deleteTicker,
  patchShares,
  getVanguardRetirement,
  postVanguardRetirement,
  deleteVanguardRetirement,
  patchVanguardRetirement,
  getTsp,
  postTsp,
  deleteTsp,
  patchTsp,
  getVanguardBrokerage,
  postVanguardBrokerage,
  deleteVanguardBrokerage,
  patchVanguardBrokerage,
  getPa529,
  postPa529,
  deletePa529,
  patchPa529,
  getCrypto,
  postCrypto,
  deleteCrypto,
  patchCrypto,
  getBask,
  postBask,
  deleteBask,
  patchBask,
  getLoans,
  postLoans,
  deleteLoans,
  patchLoans,
  getEquity,
  postEquity,
  deleteEquity,
  patchEquity,
  getReportData,
  fetchCryptoMarketData,
  getReportDataTotal,
};


    // .where(function() {
    //   this.whereIn("budget_categories_snapshot.category", categories.map(cat => cat.category));
    //   categories.forEach(cat => {
    //     if (cat.subcategory !== null) {
    //       this.orWhere("budget_categories_snapshot.subcategory", cat.subcategory);
    //     } else {
    //       this.orWhereNull("budget_categories_snapshot.subcategory");
    //     }
    //   });
    // })