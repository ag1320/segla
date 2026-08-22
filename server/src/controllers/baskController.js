import knex from "./dbConnection.js";

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
  bask_account_id,
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

export { getBask, postBask, deleteBask, patchBask };
