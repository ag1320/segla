// A rule categorizes any imported transaction whose description contains
// description_pattern (ignoring case).
export async function up(knex) {
  await knex.schema.createTable("rules", (table) => {
    table.increments("rule_id");
    table.string("description_pattern").notNullable();
    table
      .integer("account_id")
      .notNullable()
      .references("accounts.account_id")
      .onDelete("RESTRICT");
    // Blank means company-wide.
    table
      .integer("property_id")
      .references("properties.property_id")
      .onDelete("RESTRICT");
    table
      .integer("vendor_id")
      .references("vendors.vendor_id")
      .onDelete("RESTRICT");
    table.timestamps(true, true);
  });
  await knex.raw(
    "create unique index rules_description_pattern_unique on rules (lower(description_pattern))",
  );
}

export async function down(knex) {
  return knex.schema.dropTable("rules");
}
