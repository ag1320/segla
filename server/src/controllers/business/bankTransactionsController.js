import knex from "../dbConnection.js";

// Rows whose dedupe hash is already stored for that bank account are
// skipped. Returns only the rows actually inserted.
async function insertNewBankTransactions(transactions, trx = knex) {
  if (transactions.length === 0) return [];

  return trx("bank_transactions")
    .insert(transactions)
    .onConflict(["bank_account_id", "dedupe_hash"])
    .ignore()
    .returning("bank_transaction_id");
}

export { insertNewBankTransactions };
