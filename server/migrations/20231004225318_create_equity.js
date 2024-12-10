exports.up = function (knex) {
  return knex.schema.createTable("equity", async (table) => {
    table.increments("equity_id");
    table.string("address");
    table.decimal("valuation", 11, 2);
    table.decimal("remaining_balance", 11, 2);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("equity");
};
