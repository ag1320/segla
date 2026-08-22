import knex from "./dbConnection.js";

function checkBudget(month, year) {
  return knex("monthly_expenses")
    .select("*")
    .where({ month })
    .andWhere({ year })
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

function deleteMonthlyExpenses(month, year) {
  return knex("monthly_expenses")
    .del("*")
    .where({ month, year })
    .then((data) => data);
}

export { checkBudget, postIncome, postFixedExpense, deleteMonthlyExpenses };
