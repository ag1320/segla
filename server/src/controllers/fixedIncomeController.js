import knex from "./dbConnection.js";

function getFixedIncome() {
  return knex("income")
    .select("*")
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

export { getFixedIncome, editFixedIncome, deleteFixedIncome, insertFixedIncome };
