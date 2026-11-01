import knex from "../dbConnection.js";

function findAccountsByIds(accountIds, trx = knex) {
  return trx("accounts").whereIn("account_id", accountIds);
}

export { findAccountsByIds };
