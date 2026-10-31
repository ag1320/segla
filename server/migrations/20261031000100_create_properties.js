const PROPERTY_STATUSES = ["pre_rental", "active", "sold", "exchanged"];

export async function up(knex) {
  return knex.schema.createTable("properties", (table) => {
    table.increments("property_id");
    table
      .integer("entity_id")
      .notNullable()
      .references("entities.entity_id")
      .onDelete("RESTRICT");
    table.string("name").notNullable().unique();
    table.string("address");
    table
      .string("status")
      .notNullable()
      .defaultTo("pre_rental")
      .checkIn(PROPERTY_STATUSES);
    table.date("target_conversion_date");
    table.date("placed_in_service_date");
    // Depreciable basis is split because land never depreciates.
    table.bigInteger("land_basis_cents");
    table.bigInteger("building_basis_cents");
    table.check("?? >= 0", ["land_basis_cents"]);
    table.check("?? >= 0", ["building_basis_cents"]);
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTable("properties");
}
