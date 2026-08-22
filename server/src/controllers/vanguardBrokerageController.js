import knex from "./dbConnection.js";

function getVanguardBrokerage() {
  return knex("vanguard_brokerage")
    .select("*")
    .then((data) => data);
}

function postVanguardBrokerage(account_holder, account_type, current_value) {
  return knex("vanguard_brokerage")
    .insert({
      account_holder,
      account_type,
      current_value,
    })
    .then((data) => data);
}

function deleteVanguardBrokerage(vanguard_account_id) {
  return knex("vanguard_brokerage")
    .del("*")
    .where({ vanguard_account_id })
    .then((data) => data);
}

function patchVanguardBrokerage(
  account_holder,
  account_type,
  current_value,
  total_return,
  total_return_percentage,
  ytd_return_percentage,
  vanguard_account_id,
) {
  return knex("vanguard_brokerage")
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
  getVanguardBrokerage,
  postVanguardBrokerage,
  deleteVanguardBrokerage,
  patchVanguardBrokerage,
};
