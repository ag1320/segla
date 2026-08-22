import knex from "./dbConnection.js";

function getMonthlyIncome(month, year) {
  return knex("monthly_expenses")
    .select("*")
    .where({ type: "income", month, year })
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

export { getMonthlyIncome, deleteMonthlyIncome, postMonthlyIncome };
