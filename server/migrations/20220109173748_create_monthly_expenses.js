exports.up = function (knex) {
    return knex.schema.createTable("monthly_expenses", async (table) => {
      table.increments("monthly_expenses_id");
      table.string("category")
      table.string("type")
      table.decimal("amount", 8, 2);
      table.string('month');
      table.integer('year')
      table.integer('category_id')
      table.foreign('category_id').references('budget_categories_snapshot.budget_categories_snapshot_id')
      table.timestamps(true, true);
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTableIfExists("income");
  };
  