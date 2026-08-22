export async function up(knex) {
  return knex.schema.createTable("cryptocurrency", async (table) => {
    table.increments("crypto_id");
    table.string("ticker")
    table.string("name")
    table.string("url");
    table.decimal("shares", 20, 10);
    table.decimal("total_spent", 11, 2);
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("cryptocurrency");
}
