exports.up = function (knex) {
  return knex.schema.createTable("pa529", async (table) => {
    table.increments("pa529_account_id");
    table.string("beneficiary")
    table.decimal("current_value", 11, 2);
    table.decimal("total_return", 11, 2);
    table.string("projected_college_year");
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("pa529");
};