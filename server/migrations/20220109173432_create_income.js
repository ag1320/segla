exports.up = function (knex) {
  return knex.schema.createTable("income", async (table) => {
    table.increments("income_id");
    table.string("name")
    table.decimal("amount", 8, 2);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("income");
};
