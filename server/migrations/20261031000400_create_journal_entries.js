const ENTRY_SOURCES = ["import", "manual", "system"];

export async function up(knex) {
  return knex.schema.createTable("journal_entries", (table) => {
    table.increments("journal_entry_id");
    table
      .integer("entity_id")
      .notNullable()
      .references("entities.entity_id")
      .onDelete("RESTRICT");
    table.date("entry_date").notNullable();
    table.text("memo");
    table.string("source").notNullable().checkIn(ENTRY_SOURCES);
    // Unique: an entry can be reversed only once.
    table
      .integer("reverses_journal_entry_id")
      .unique()
      .references("journal_entries.journal_entry_id")
      .onDelete("RESTRICT");
    table.check(
      "reverses_journal_entry_id <> journal_entry_id",
      [],
      "journal_entries_cannot_reverse_itself",
    );
    table.index(["entity_id", "entry_date"]);
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTable("journal_entries");
}
