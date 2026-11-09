const ASSET_CLASSES = ["land", "building", "building_improvement", "land_improvement", "furnishings"];

// Things a property is made of that are depreciated (or, for land, never
// are). The books carry each at cost; these records drive the monthly
// depreciation estimate.
export async function up(knex) {
  return knex.schema.createTable("fixed_assets", (table) => {
    table.increments("fixed_asset_id");
    table
      .integer("property_id")
      .notNullable()
      .references("properties.property_id")
      .onDelete("RESTRICT");
    table.string("name").notNullable();
    table.string("asset_class").notNullable().checkIn(ASSET_CLASSES);
    table.bigInteger("cost_cents").notNullable();
    table.date("in_service_date").notNullable();
    table.date("disposal_date");
    // In a 1031 exchange the new property continues the old one's
    // depreciation.
    table
      .integer("carryover_from_fixed_asset_id")
      .references("fixed_assets.fixed_asset_id")
      .onDelete("RESTRICT");
    table.check("?? > 0", ["cost_cents"]);
    table.check("?? is null or ?? >= ??", ["disposal_date", "disposal_date", "in_service_date"]);
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTable("fixed_assets");
}
