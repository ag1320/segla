const ENTITY_TYPES = ["sole_proprietorship", "llc"];

export async function up(knex) {
  return knex.schema.createTable("entities", (table) => {
    table.increments("entity_id");
    table.string("name").notNullable().unique();
    table.string("entity_type").notNullable().checkIn(ENTITY_TYPES);
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTable("entities");
}
