// What the property would rent for today. The operating statement prices
// vacant days at this rent to show what vacancy cost.
export async function up(knex) {
  await knex.schema.alterTable("properties", (table) => {
    table.bigInteger("market_rent_cents");
  });
  await knex.raw(
    "alter table properties add constraint properties_market_rent_positive check (market_rent_cents is null or market_rent_cents > 0)",
  );
}

export async function down(knex) {
  await knex.raw("alter table properties drop constraint properties_market_rent_positive");
  await knex.schema.alterTable("properties", (table) => {
    table.dropColumn("market_rent_cents");
  });
}
