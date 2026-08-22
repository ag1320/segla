export async function up(knex) {
  return knex.schema.createTable("pa529", async (table) => {
    table.increments("pa529_account_id");
    table.string("beneficiary")
    table.decimal("current_value", 11, 2);
    table.decimal("total_return", 11, 2);
    table.string("projected_college_year");
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("pa529");
}
