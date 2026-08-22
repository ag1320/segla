export async function up(knex) {
  return knex.schema.createTable("budget_categories_snapshot", async (table) => {
    table.increments("budget_categories_snapshot_id");
    table.string("category")
    table.string("subcategory")
    table.decimal("warning", 6, 2);
    table.decimal("limit", 6, 2);
    table.string('month')
    table.string('year')
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("budget_categories_snapshot");
}
