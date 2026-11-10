import knex from "../dbConnection.js";

// Every line of entityId's entries dated from `from` through `to` that
// have at least one line naming a vendor, so each payment's other side
// (card, bank, personal money) can be seen.
function findVendorEntryLines({ entityId, from, to }, trx = knex) {
  const vendorEntryIds = trx("journal_lines")
    .join("journal_entries", "journal_entries.journal_entry_id", "journal_lines.journal_entry_id")
    .where("journal_entries.entity_id", entityId)
    .where("journal_entries.entry_date", ">=", from)
    .where("journal_entries.entry_date", "<=", to)
    .whereNotNull("journal_lines.vendor_id")
    .distinct("journal_lines.journal_entry_id");

  return trx("journal_lines")
    .whereIn("journal_entry_id", vendorEntryIds)
    .select("journal_entry_id", "account_id", "vendor_id", "debit_cents", "credit_cents");
}

// Every line on accountId through `to`, oldest first, with what a CPA
// needs to see beside each amount.
function findAccountLines({ entityId, accountId, to }, trx = knex) {
  return trx("journal_lines")
    .join("journal_entries", "journal_entries.journal_entry_id", "journal_lines.journal_entry_id")
    .where("journal_entries.entity_id", entityId)
    .where("journal_lines.account_id", accountId)
    .where("journal_entries.entry_date", "<=", to)
    .select(
      "journal_lines.journal_line_id",
      "journal_lines.property_id",
      "journal_lines.vendor_id",
      "journal_lines.debit_cents",
      "journal_lines.credit_cents",
      "journal_lines.needs_cpa_review",
      "journal_entries.journal_entry_id",
      knex.raw("to_char(journal_entries.entry_date, 'YYYY-MM-DD') as entry_date"),
      "journal_entries.memo",
    )
    .orderBy([{ column: "journal_entries.entry_date" }, { column: "journal_lines.journal_line_id" }]);
}

export { findVendorEntryLines, findAccountLines };
