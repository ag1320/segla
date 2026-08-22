import knex from "./dbConnection.js";

function getPa529() {
  return knex("pa529")
    .select("*")
    .then((data) => data);
}

function postPa529(
  beneficiary,
  current_value,
  total_return,
  projected_college_year,
) {
  return knex("pa529")
    .insert({
      beneficiary,
      current_value,
      total_return,
      projected_college_year,
    })
    .then((data) => data);
}

function deletePa529(pa529_account_id) {
  return knex("pa529")
    .del("*")
    .where({ pa529_account_id })
    .then((data) => data);
}

function patchPa529(
  beneficiary,
  current_value,
  total_return,
  projected_college_year,
  pa529_account_id,
) {
  return knex("pa529")
    .update({
      beneficiary,
      current_value,
      total_return,
      projected_college_year,
    })
    .where({ pa529_account_id })
    .then((data) => data);
}

export { getPa529, postPa529, deletePa529, patchPa529 };
