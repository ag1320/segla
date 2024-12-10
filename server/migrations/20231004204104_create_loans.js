exports.up = function (knex) {
  return knex.schema.createTable("loans", async (table) => {
    table.increments("loan_account_id");
    table.string("url");
    table.string("account_holder");
    table.decimal("interest_rate", 5, 2);
    table.string("payoff_date");
    table.decimal("monthly_payment", 11, 2);
    table.decimal("remaining_balance", 11, 2);
    table.string("type");
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("loans");
};
