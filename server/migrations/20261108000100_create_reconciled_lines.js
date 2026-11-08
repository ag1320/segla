// The journal lines a reconciliation matched to its statement ("cleared").
// Kept apart from journal_lines so posted lines are never edited. Undoing a
// reconciliation un-clears its lines.
export async function up(knex) {
  await knex.schema.createTable("reconciled_lines", (table) => {
    table.increments("reconciled_line_id");
    table
      .integer("reconciliation_id")
      .notNullable()
      .references("reconciliations.reconciliation_id")
      .onDelete("CASCADE");
    // A line clears on one statement only.
    table
      .integer("journal_line_id")
      .notNullable()
      .unique()
      .references("journal_lines.journal_line_id")
      .onDelete("RESTRICT");
    table.index("reconciliation_id");
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTable("reconciled_lines");
}
