// The depreciation the CPA claimed on the tax return, per asset and year.
// It replaces Segla's estimate for that year.
export async function up(knex) {
  return knex.schema.createTable("cpa_depreciation", (table) => {
    table.increments("cpa_depreciation_id");
    table
      .integer("fixed_asset_id")
      .notNullable()
      .references("fixed_assets.fixed_asset_id")
      .onDelete("CASCADE");
    table.integer("tax_year").notNullable();
    table.bigInteger("amount_cents").notNullable();
    table.check("?? >= 0", ["amount_cents"]);
    table.unique(["fixed_asset_id", "tax_year"]);
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTable("cpa_depreciation");
}
