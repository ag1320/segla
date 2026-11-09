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
  knex.raw(
    "(select reversals.journal_entry_id from journal_entries as reversals where reversals.reverses_journal_entry_id = journal_entries.journal_entry_id) as reversed_by_journal_entry_id",
  ),
  "created_at",
];

// Each filter is optional. accountId keeps entries with at least one line
// on that account, and returns all of their lines.
function findJournalEntries({ from, to, accountId }, trx = knex) {
  return trx("journal_entries")
    .select(JOURNAL_ENTRY_COLUMNS)
    .modify((query) => {
      if (from) query.where("journal_entries.entry_date", ">=", from);
      if (to) query.where("journal_entries.entry_date", "<=", to);
      if (accountId) {
        query.whereIn(
          "journal_entry_id",
          trx("journal_lines")
            .select("journal_entry_id")
            .where({ account_id: accountId }),
        );
      }
    })
    .orderBy([
      { column: "journal_entries.entry_date" },
      { column: "journal_entry_id" },
    ]);
}

function findJournalEntry(journalEntryId, trx = knex) {
  return trx("journal_entries")
    .select(JOURNAL_ENTRY_COLUMNS)
    .where({ journal_entry_id: journalEntryId })
    .first();
}

function findJournalLines(journalEntryId, trx = knex) {
  return trx("journal_lines")
    .where({ journal_entry_id: journalEntryId })
    .orderBy("journal_line_id");
}

function findJournalLinesForEntries(journalEntryIds, trx = knex) {
  return trx("journal_lines")
    .whereIn("journal_entry_id", journalEntryIds)
    .orderBy("journal_line_id");
}

async function insertJournalEntry(entry, trx = knex) {
  const [{ journal_entry_id }] = await trx("journal_entries")
    .insert(entry)
    .returning("journal_entry_id");
  return findJournalEntry(journal_entry_id, trx);
}

async function hasJournalLinesThrough({ accountId, throughDate }, trx = knex) {
  const line = await trx("journal_lines")
    .join("journal_entries", "journal_entries.journal_entry_id", "journal_lines.journal_entry_id")
    .where("journal_lines.account_id", accountId)
    .where("journal_entries.entry_date", "<=", throughDate)
    .first("journal_lines.journal_line_id");
  return line !== undefined;
}

// The date of entityId's earliest line on accountId, or null if none.
async function findFirstLineDate({ entityId, accountId }, trx = knex) {
  const row = await trx("journal_lines")
    .join("journal_entries", "journal_entries.journal_entry_id", "journal_lines.journal_entry_id")
    .where("journal_entries.entity_id", entityId)
    .where("journal_lines.account_id", accountId)
    .first(knex.raw("to_char(min(journal_entries.entry_date), 'YYYY-MM-DD') as first_date"));
  return row.first_date;
}

function insertJournalLines(lines, trx = knex) {
  return trx("journal_lines").insert(lines).returning("*");
}

export {
  findJournalEntries,
  findJournalEntry,
  findJournalLines,
  findJournalLinesForEntries,
  hasJournalLinesThrough,
  findFirstLineDate,
  insertJournalEntry,
  insertJournalLines,
};
