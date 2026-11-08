import knex from "../dbConnection.js";

// Debit and credit totals per account for entityId's entries dated from
// `from` through `to` (each optional). propertyId keeps only that
// property's lines. With byProperty, one row per account and property,
// where property_id null is company-wide. Sums are cast back to bigint so
// pg returns them as numbers.
function findAccountTotals({ entityId, from, to, propertyId, byProperty = false }, trx = knex) {
  const groupColumns = byProperty
    ? ["journal_lines.account_id", "journal_lines.property_id"]
    : ["journal_lines.account_id"];

  return trx("journal_lines")
    .join("journal_entries", "journal_entries.journal_entry_id", "journal_lines.journal_entry_id")
    .where("journal_entries.entity_id", entityId)
    .modify((query) => {
      if (from) query.where("journal_entries.entry_date", ">=", from);
      if (to) query.where("journal_entries.entry_date", "<=", to);
      if (propertyId) query.where("journal_lines.property_id", propertyId);
    })
    .groupBy(groupColumns)
    .select(
      ...groupColumns,
      knex.raw("sum(journal_lines.debit_cents)::bigint as debit_cents"),
      knex.raw("sum(journal_lines.credit_cents)::bigint as credit_cents"),
    );
}

// Every line of entityId's entries dated from `from` through `to`, in
// account-number order and then date order, ready to list account by
// account.
function findLedgerLines({ entityId, from, to }, trx = knex) {
  return trx("journal_lines")
    .join("journal_entries", "journal_entries.journal_entry_id", "journal_lines.journal_entry_id")
    .join("accounts", "accounts.account_id", "journal_lines.account_id")
    .where("journal_entries.entity_id", entityId)
    .where("journal_entries.entry_date", ">=", from)
    .where("journal_entries.entry_date", "<=", to)
    .select(
      "journal_lines.journal_line_id",
      "journal_lines.account_id",
      "journal_lines.property_id",
      "journal_lines.debit_cents",
      "journal_lines.credit_cents",
      "journal_entries.journal_entry_id",
      knex.raw("to_char(journal_entries.entry_date, 'YYYY-MM-DD') as entry_date"),
      "journal_entries.memo",
      "journal_entries.source",
    )
    .orderBy([
      { column: "accounts.account_number" },
      { column: "journal_entries.entry_date" },
      { column: "journal_entries.journal_entry_id" },
      { column: "journal_lines.journal_line_id" },
    ]);
}

export { findAccountTotals, findLedgerLines };
