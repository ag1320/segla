import knex from "./dbConnection.js";

function getLoans() {
  return knex("loans")
    .select("*")
    .then((data) => data);
}

function postLoans(
  url,
  account_holder,
  interest_rate,
  payoff_date,
  monthly_payment,
  remaining_balance,
  type,
) {
  return knex("loans")
    .insert({
      url,
      account_holder,
      interest_rate,
      payoff_date,
      monthly_payment,
      remaining_balance,
      type,
    })
    .then((data) => data);
}

function deleteLoans(loan_account_id) {
  return knex("loans")
    .del("*")
    .where({ loan_account_id })
    .then((data) => data);
}

function patchLoans(
  url,
  account_holder,
  interest_rate,
  payoff_date,
  monthly_payment,
  remaining_balance,
  loan_account_id,
) {
  return knex("loans")
    .update({
      url,
      account_holder,
      interest_rate,
      payoff_date,
      monthly_payment,
      remaining_balance,
    })
    .where({ loan_account_id })
    .then((data) => data);
}

export { getLoans, postLoans, deleteLoans, patchLoans };
