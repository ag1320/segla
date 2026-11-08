import knex from "../dbConnection.js";

const RECONCILIATION_COLUMNS = [
  "reconciliation_id",
  "bank_account_id",
  knex.raw("to_char(statement_date, 'YYYY-MM-DD') as statement_date"),
  "statement_balance_cents",
  "created_at",
];

// Newest statement first.
function findReconciliations(bankAccountId, trx = knex) {
  return trx("reconciliations")
    .select(RECONCILIATION_COLUMNS)
    .modify((query) => {
      if (bankAccountId) query.where({ bank_account_id: bankAccountId });
    })
    .orderBy([
      { column: "bank_account_id" },
      { column: "reconciliations.statement_date", order: "desc" },
    ]);
}

function findReconciliation(reconciliationId, trx = knex) {
  return trx("reconciliations")
    .select(RECONCILIATION_COLUMNS)
    .where({ reconciliation_id: reconciliationId })
    .first();
}

function findLatestReconciliation(bankAccountId, trx = knex) {
  return trx("reconciliations")
    .select(RECONCILIATION_COLUMNS)
    .where({ bank_account_id: bankAccountId })
    .orderBy("reconciliations.statement_date", "desc")
    .first();
}

// Lines on accountId dated on or before throughDate that no statement has
// cleared yet, oldest first.
// An entry reversed before it cleared, and its reversal, are left out: the
// pair nets to zero and never reached the bank. Without this, an entry
// dated in one statement period and undone in the next would leave both
// statements off by its amount.
function findUnclearedLines({ accountId, throughDate }, trx = knex) {
  return trx("journal_lines")
    .join("journal_entries", "journal_entries.journal_entry_id", "journal_lines.journal_entry_id")
    .leftJoin("reconciled_lines", "reconciled_lines.journal_line_id", "journal_lines.journal_line_id")
    .select(
      "journal_lines.journal_line_id",
      "journal_entries.journal_entry_id",
      knex.raw("to_char(journal_entries.entry_date, 'YYYY-MM-DD') as entry_date"),
      "journal_entries.memo",
      "journal_lines.debit_cents",
      "journal_lines.credit_cents",
    )
    .where("journal_lines.account_id", accountId)
    .whereNull("reconciled_lines.journal_line_id")
    .where("journal_entries.entry_date", "<=", throughDate)
    // Not an uncleared entry that was later reversed...
    .whereNotExists(
      trx("journal_entries as reversal")
        .select(knex.raw("1"))
        .whereRaw("reversal.reverses_journal_entry_id = journal_entries.journal_entry_id"),
    )
    // ...nor the reversal of an entry whose line never cleared.
    .where((query) =>
      query.whereNull("journal_entries.reverses_journal_entry_id").orWhereExists(
        trx("journal_lines as original_line")
          .join(
            "reconciled_lines as original_cleared",
            "original_cleared.journal_line_id",
            "original_line.journal_line_id",
          )
          .select(knex.raw("1"))
          .whereRaw("original_line.journal_entry_id = journal_entries.reverses_journal_entry_id")
          .whereRaw("original_line.account_id = journal_lines.account_id"),
      ),
    )
    .orderBy([
      { column: "journal_entries.entry_date" },
      { column: "journal_lines.journal_line_id" },
    ]);
}

async function insertReconciliation(reconciliation, trx = knex) {
  const [{ reconciliation_id }] = await trx("reconciliations")
    .insert(reconciliation)
    .returning("reconciliation_id");
  return findReconciliation(reconciliation_id, trx);
}

function insertReconciledLines(reconciliationId, journalLineIds, trx = knex) {
  if (journalLineIds.length === 0) return [];
  return trx("reconciled_lines").insert(
    journalLineIds.map((journalLineId) => ({
      reconciliation_id: reconciliationId,
      journal_line_id: journalLineId,
    })),
  );
}

// Its reconciled_lines rows go with it (ON DELETE CASCADE).
function deleteReconciliation(reconciliationId, trx = knex) {
  return trx("reconciliations").where({ reconciliation_id: reconciliationId }).delete();
}

export {
  findReconciliations,
  findReconciliation,
  findLatestReconciliation,
  findUnclearedLines,
  insertReconciliation,
  insertReconciledLines,
  deleteReconciliation,
};
