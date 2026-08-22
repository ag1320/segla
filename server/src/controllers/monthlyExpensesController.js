import knex from "./dbConnection.js";

function getMonthlyExpenses(month, year, type) {
  return knex("monthly_expenses")
    .select("*")
    .where({ type, month, year })
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

function deleteMonthlyVariedExpenses(monthly_expenses_id) {
  return knex("monthly_expenses")
    .del("*")
    .where({ monthly_expenses_id })
    .then((data) => data);
}

export {
  getMonthlyExpenses,
  getCategoryId,
  insertVariedExpense,
  getMonthlyVariedExpenses,
  deleteMonthlyVariedExpenses,
};
