import knex from "./dbConnection.js";

function getFixedExpenses() {
  return knex("fixed_expenses")
    .select("*")
    .then((data) => data);
}

function editFixedExpenseAaron(category, oldCategory, aaron, isDiscretionary) {
  let name = category;
  let owner = "Aaron";
  let amount = aaron;
  return knex("fixed_expenses")
    .update({
      name,
      amount,
      is_discretionary: isDiscretionary,
    })
    .where({ name: oldCategory, owner })
    .then((data) => data);
}

function editFixedExpenseJen(category, oldCategory, jen, isDiscretionary) {
  let name = category;
  let owner = "Jen";
  let amount = jen;
  return knex("fixed_expenses")
    .update({
      name,
      amount,
      is_discretionary: isDiscretionary,
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

function insertFixedExpense(category, aaron, jen, isDiscretionary) {
  let name = category;
  let is_discretionary = isDiscretionary;
  return knex("fixed_expenses")
    .insert([
      { name, owner: "Aaron", amount: aaron, is_discretionary },
      { name, owner: "Jen", amount: jen, is_discretionary },
    ])
    .then((data) => data);
}

export {
  getFixedExpenses,
  editFixedExpenseAaron,
  editFixedExpenseJen,
  deleteFixedExpense,
  insertFixedExpense,
};
