export async function up(knex) {
  return knex.schema.createTable("bask", async (table) => {
    table.increments("bask_account_id");
    table.decimal("interest_rate", 5, 2);
    table.decimal("current_value", 11, 2);
    table.decimal("total_return", 11, 2);
    table.decimal("ytd_return", 11, 2);
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("bask");
}
