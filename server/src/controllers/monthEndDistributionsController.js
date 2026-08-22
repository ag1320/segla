import knex from "./dbConnection.js";

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

export {
  getMonthEndDistributions,
  postMonthEndDistribution,
  deleteMonthEndDistribution,
};
