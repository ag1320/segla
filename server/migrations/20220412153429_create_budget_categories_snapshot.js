exports.up = function (knex) {
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
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("budget_categories_snapshot");
};
