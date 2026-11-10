// Gettemy Properties (and any future business) as one net worth line: its
// equity at market value. Snapshots taken before this column stay at 0.
export async function up(knex) {
  await knex.schema.alterTable("net_worth_snapshots", (table) => {
    table.decimal("business_equity", 12, 2).notNullable().defaultTo(0);
  });
}

export async function down(knex) {
  await knex.schema.alterTable("net_worth_snapshots", (table) => {
    table.dropColumn("business_equity");
  });
}
