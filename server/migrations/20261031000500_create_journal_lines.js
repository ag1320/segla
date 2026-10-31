export async function up(knex) {
  return knex.schema.createTable("journal_lines", (table) => {
    table.increments("journal_line_id");
    table
      .integer("journal_entry_id")
      .notNullable()
      .references("journal_entries.journal_entry_id")
      .onDelete("RESTRICT");
    table
      .integer("account_id")
      .notNullable()
      .references("accounts.account_id")
      .onDelete("RESTRICT");
    // Blank means company-wide (CPA fees, software).
    table
      .integer("property_id")
      .references("properties.property_id")
      .onDelete("RESTRICT");
    table.bigInteger("debit_cents").notNullable().defaultTo(0);
    table.bigInteger("credit_cents").notNullable().defaultTo(0);
    table.check(
      "(debit_cents > 0 and credit_cents = 0) or (debit_cents = 0 and credit_cents > 0)",
      [],
      "journal_lines_debit_or_credit",
    );
    table.boolean("needs_cpa_review").notNullable().defaultTo(false);
    table.index("journal_entry_id");
    table.index("account_id");
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTable("journal_lines");
}
