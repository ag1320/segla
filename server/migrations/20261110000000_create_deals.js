// Properties being considered, with the assumptions they were analyzed
// under. Scratch work, not ledger records: inputs is a JSON object
// validated by the route (see dealsRoutes.js for its fields).
export async function up(knex) {
  return knex.schema.createTable("deals", (table) => {
    table.increments("deal_id");
    table
      .integer("entity_id")
      .notNullable()
      .references("entities.entity_id")
      .onDelete("RESTRICT");
    table.string("name").notNullable();
    table.jsonb("inputs").notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTable("deals");
}
