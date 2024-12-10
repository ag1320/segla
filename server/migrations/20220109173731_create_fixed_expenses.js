exports.up = function (knex) {
    return knex.schema.createTable("fixed_expenses", async (table) => {
      table.increments("fixed_expenses_id");
      table.string("name")
      table.string('owner')
      table.decimal("amount", 8, 2);    
      table.timestamps(true, true);
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTableIfExists("fixed_expenses");
  };
  