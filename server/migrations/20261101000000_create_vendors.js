export async function up(knex) {
  return knex.schema.createTable("vendors", (table) => {
    table.increments("vendor_id");
    table.string("name").notNullable().unique();
    // Service vendors paid by non-card methods may need a 1099.
    table.boolean("is_1099_eligible").notNullable().defaultTo(false);
    table.boolean("has_w9_on_file").notNullable().defaultTo(false);
    // Where the W-9 is stored, never the tax ID itself.
    table.string("w9_location");
    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTable("vendors");
}
