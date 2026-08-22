export async function up(knex) {
  return knex.schema.createTable("fixed_expenses", async (table) => {
    table.increments("fixed_expenses_id");
    table.string("name")
    table.string('owner')
    table.decimal("amount", 8, 2);
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("fixed_expenses");
}
