import knex from "../dbConnection.js";

function findBankAccounts(trx = knex) {
  return trx("bank_accounts").orderBy("name");
}

function findBankAccount(bankAccountId, trx = knex) {
  return trx("bank_accounts").where({ bank_account_id: bankAccountId }).first();
}

export { findBankAccounts, findBankAccount };
