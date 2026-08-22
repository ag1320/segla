import knex from "./dbConnection.js";

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
  ytd_return_percentage,
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

function deleteTsp(tsp_account_id) {
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
  tsp_account_id,
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

export { getTsp, postTsp, deleteTsp, patchTsp };
