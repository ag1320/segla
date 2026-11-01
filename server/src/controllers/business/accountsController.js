import knex from "../dbConnection.js";

function findAccounts(trx = knex) {
  return trx("accounts").orderBy("account_number");
}

function findAccount(accountId, trx = knex) {
  return trx("accounts").where({ account_id: accountId }).first();
}

function findAccountByNumber(accountNumber, trx = knex) {
  return trx("accounts").where({ account_number: accountNumber }).first();
}

function findAccountsByIds(accountIds, trx = knex) {
  return trx("accounts").whereIn("account_id", accountIds);
}

async function insertAccount(account, trx = knex) {
  const [inserted] = await trx("accounts").insert(account).returning("*");
  return inserted;
}

async function updateAccount(accountId, changes, trx = knex) {
  const [updated] = await trx("accounts")
    .where({ account_id: accountId })
    .update({ ...changes, updated_at: knex.fn.now() })
    .returning("*");
  return updated;
}

export {
  findAccounts,
  findAccount,
  findAccountByNumber,
  findAccountsByIds,
  insertAccount,
  updateAccount,
};
