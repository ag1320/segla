const VALUATION_SOURCES = ["appraisal", "broker", "online_estimate"];

// Market value estimates over time. Not ledger records: the books carry a
// property at cost, so these never post and can be edited or deleted.
export async function up(knex) {
  return knex.schema.createTable("property_valuations", (table) => {
    table.increments("property_valuation_id");
    table
      .integer("property_id")
      .notNullable()
      .references("properties.property_id")
      .onDelete("CASCADE");
    table.date("valuation_date").notNullable();
    table.bigInteger("value_cents").notNullable();
    table.string("source").notNullable().checkIn(VALUATION_SOURCES);
    table.string("note");
    table.check("?? > 0", ["value_cents"]);
    table.unique(["property_id", "valuation_date"]);
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTable("property_valuations");
}
