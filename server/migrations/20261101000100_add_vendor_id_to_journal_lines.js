export async function up(knex) {
  return knex.schema.alterTable("journal_lines", (table) => {
    table
      .integer("vendor_id")
      .references("vendors.vendor_id")
      .onDelete("RESTRICT");
    table.index("vendor_id");
  });
}

export async function down(knex) {
  return knex.schema.alterTable("journal_lines", (table) => {
    table.dropColumn("vendor_id");
  });
}
