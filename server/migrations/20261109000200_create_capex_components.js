// The big-ticket parts of a property that wear out (roof, HVAC, water
// heater). They drive the capex reserve plan; they're not ledger records.
export async function up(knex) {
  return knex.schema.createTable("capex_components", (table) => {
    table.increments("capex_component_id");
    table
      .integer("property_id")
      .notNullable()
      .references("properties.property_id")
      .onDelete("RESTRICT");
    table.string("name").notNullable();
    table.integer("install_year").notNullable();
    table.integer("useful_life_years").notNullable();
    table.bigInteger("replacement_cost_cents").notNullable();
    table.check("?? > 0", ["useful_life_years"]);
    table.check("?? > 0", ["replacement_cost_cents"]);
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTable("capex_components");
}
