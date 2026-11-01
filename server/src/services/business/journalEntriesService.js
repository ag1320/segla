import {
  findJournalEntries,
  findJournalEntry,
  findJournalLines,
  findJournalLinesForEntries,
} from "../../controllers/business/journalEntriesController.js";
import { NotFoundError } from "../../utils/errors.js";

async function findJournalEntriesWithLines({ from, to, accountId }) {
  const entries = await findJournalEntries({ from, to, accountId });
  const lines = await findJournalLinesForEntries(
    entries.map((entry) => entry.journal_entry_id),
  );
  const linesByEntryId = Object.groupBy(lines, (line) => line.journal_entry_id);

  return entries.map((entry) => ({
    ...entry,
    lines: linesByEntryId[entry.journal_entry_id] ?? [],
  }));
}

async function findJournalEntryWithLines(journalEntryId) {
  const entry = await findJournalEntry(journalEntryId);
  if (!entry) {
    throw new NotFoundError(`Journal entry ${journalEntryId} not found`);
  }
  const lines = await findJournalLines(journalEntryId);
  return { ...entry, lines };
}

export { findJournalEntriesWithLines, findJournalEntryWithLines };
