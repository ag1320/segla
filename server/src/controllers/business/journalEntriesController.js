import knex from "../dbConnection.js";

// Dates come back as 'YYYY-MM-DD' strings. Without to_char, pg turns a date
// into a JS Date at local midnight, which can shift it by a day.
const JOURNAL_ENTRY_COLUMNS = [
  "journal_entry_id",
  "entity_id",
  knex.raw("to_char(entry_date, 'YYYY-MM-DD') as entry_date"),
  "memo",
  "source",
  "reverses_journal_entry_id",
  "created_at",
];

function findJournalEntry(journalEntryId, trx = knex) {
  return trx("journal_entries")
    .select(JOURNAL_ENTRY_COLUMNS)
    .where({ journal_entry_id: journalEntryId })
    .first();
}

function findReversalOf(journalEntryId, trx = knex) {
  return trx("journal_entries")
    .select(JOURNAL_ENTRY_COLUMNS)
    .where({ reverses_journal_entry_id: journalEntryId })
    .first();
}

function findJournalLines(journalEntryId, trx = knex) {
  return trx("journal_lines")
    .where({ journal_entry_id: journalEntryId })
    .orderBy("journal_line_id");
}

async function insertJournalEntry(entry, trx = knex) {
  const [{ journal_entry_id }] = await trx("journal_entries")
    .insert(entry)
    .returning("journal_entry_id");
  return findJournalEntry(journal_entry_id, trx);
}

function insertJournalLines(lines, trx = knex) {
  return trx("journal_lines").insert(lines).returning("*");
}

export {
  findJournalEntry,
  findReversalOf,
  findJournalLines,
  insertJournalEntry,
  insertJournalLines,
};
