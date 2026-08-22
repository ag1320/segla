import knex from "./dbConnection.js";

function getEquity() {
  return knex("equity")
    .select("*")
    .then((data) => data);
}

function postEquity(address, valuation, remaining_balance) {
  return knex("equity")
    .insert({
      address,
      valuation,
      remaining_balance,
    })
    .then((data) => data);
}

function deleteEquity(equity_id) {
  return knex("equity")
    .del("*")
    .where({ equity_id })
    .then((data) => data);
}

function patchEquity(address, valuation, remaining_balance, equity_id) {
  return knex("equity")
    .update({
      address,
      valuation,
      remaining_balance,
    })
    .where({ equity_id })
    .then((data) => data);
}

export { getEquity, postEquity, deleteEquity, patchEquity };
