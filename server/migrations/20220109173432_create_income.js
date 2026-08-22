export async function up(knex) {
  return knex.schema.createTable("income", async (table) => {
    table.increments("income_id");
    table.string("name")
    table.decimal("amount", 8, 2);
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("income");
}
