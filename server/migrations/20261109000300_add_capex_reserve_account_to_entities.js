// The cash account that holds the entity's capex reserve. Its balance is
// what the reserve plan counts as saved.
export async function up(knex) {
  await knex.schema.alterTable("entities", (table) => {
    table
      .integer("capex_reserve_account_id")
      .references("accounts.account_id")
      .onDelete("RESTRICT");
  });
}

export async function down(knex) {
  await knex.schema.alterTable("entities", (table) => {
    table.dropColumn("capex_reserve_account_id");
  });
}
