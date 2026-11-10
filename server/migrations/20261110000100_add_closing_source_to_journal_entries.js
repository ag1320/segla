// A year-end closing entry moves every income and expense balance into
// retained earnings. It gets its own source so activity reports (P&L,
// Schedule E) can leave it out while balance reports keep it.
export async function up(knex) {
  await knex.raw("alter table journal_entries drop constraint journal_entries_source_check");
  await knex.raw(
    "alter table journal_entries add constraint journal_entries_source_check check (source in ('import', 'manual', 'system', 'closing'))",
  );
}

export async function down(knex) {
  await knex.raw("alter table journal_entries drop constraint journal_entries_source_check");
  await knex.raw(
    "alter table journal_entries add constraint journal_entries_source_check check (source in ('import', 'manual', 'system'))",
  );
}
