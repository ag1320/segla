import knex from "./dbConnection.js";

function getVanguardRetirement() {
  return knex("vanguard_retirement")
    .select("*")
    .then((data) => data);
}

function postVanguardRetirement(account_holder, account_type, current_value) {
  return knex("vanguard_retirement")
    .insert({
      account_holder,
      account_type,
      current_value,
    })
    .then((data) => data);
}

function deleteVanguardRetirement(vanguard_account_id) {
  return knex("vanguard_retirement")
    .del("*")
    .where({ vanguard_account_id })
    .then((data) => data);
}

function patchVanguardRetirement(
  account_holder,
  account_type,
  current_value,
  total_return,
  total_return_percentage,
  ytd_return_percentage,
  vanguard_account_id,
) {
  console.log(
    "payload",
    account_holder,
    account_type,
    current_value,
    total_return,
    total_return_percentage,
    ytd_return_percentage,
    vanguard_account_id,
  );
  return knex("vanguard_retirement")
    .update({
      account_holder,
      account_type,
      current_value,
      total_return,
      total_return_percentage,
      ytd_return_percentage,
    })
    .where({ vanguard_account_id })
    .then((data) => data);
}

export {
  getVanguardRetirement,
  postVanguardRetirement,
  deleteVanguardRetirement,
  patchVanguardRetirement,
};
