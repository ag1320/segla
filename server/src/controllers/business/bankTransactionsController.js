import knex from "../dbConnection.js";

// to_char keeps the date a 'YYYY-MM-DD' string (see journalEntriesController).
const BANK_TRANSACTION_COLUMNS = [
  "bank_transaction_id",
  "bank_account_id",
  knex.raw("to_char(transaction_date, 'YYYY-MM-DD') as transaction_date"),
  "description",
  "amount_cents",
  "status",
  "journal_entry_id",
];

// Each filter is optional. Newest first, as on a bank statement.
function findBankTransactions({ status, bankAccountId }, trx = knex) {
  return trx("bank_transactions")
    .select(BANK_TRANSACTION_COLUMNS)
    .modify((query) => {
      if (status) query.where({ status });
      if (bankAccountId) query.where({ bank_account_id: bankAccountId });
    })
    .orderBy([
      { column: "bank_transactions.transaction_date", order: "desc" },
      { column: "bank_transaction_id", order: "desc" },
    ]);
}

// Locks the row until trx ends, so two clicks can't post it twice.
function findBankTransactionForUpdate(bankTransactionId, trx) {
  return trx("bank_transactions")
    .select(BANK_TRANSACTION_COLUMNS)
    .where({ bank_transaction_id: bankTransactionId })
    .forUpdate()
    .first();
}

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

async function updateBankTransaction(bankTransactionId, changes, trx = knex) {
  const [updated] = await trx("bank_transactions")
    .where({ bank_transaction_id: bankTransactionId })
    .update({ ...changes, updated_at: knex.fn.now() })
    .returning(BANK_TRANSACTION_COLUMNS);
  return updated;
}

function reopenBankTransactionsForEntry(journalEntryId, trx = knex) {
  return trx("bank_transactions")
    .where({ journal_entry_id: journalEntryId })
    .update({ status: "new", journal_entry_id: null, updated_at: knex.fn.now() });
}

export {
  findBankTransactions,
  findBankTransactionForUpdate,
  insertNewBankTransactions,
  updateBankTransaction,
  reopenBankTransactionsForEntry,
};
