import knex from "./dbConnection.js";

function getFixedExpenses() {
  return knex("fixed_expenses")
    .select("*")
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

export {
  getFixedExpenses,
  editFixedExpenseAaron,
  editFixedExpenseJen,
  deleteFixedExpense,
  insertFixedExpense,
};
