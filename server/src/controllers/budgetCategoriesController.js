import knex from "./dbConnection.js";

function getCurrentBudgetCategories() {
  return knex("budget_categories")
    .select("*")
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

function deleteBudgetCategories(month, year) {
  return knex("budget_categories_snapshot")
    .del("*")
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

export {
  getCurrentBudgetCategories,
  postBudgetCategories,
  getBudgetCategories,
  deleteBudgetCategories,
  patchBudgetCategory,
  deleteBudgetCategory,
  postBudgetCategory,
};
