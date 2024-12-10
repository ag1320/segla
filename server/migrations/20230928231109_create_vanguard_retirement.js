exports.up = function (knex) {
  return knex.schema.createTable("vanguard_retirement", async (table) => {
    table.increments("vanguard_account_id");
    table.string("account_holder")
    table.string("account_type")
    table.decimal("current_value", 11, 2);
    table.decimal("total_return", 11, 2);
    table.decimal("total_return_percentage", 5, 2);
    table.decimal("ytd_return_percentage", 5, 2);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("vanguard_retirement");
};