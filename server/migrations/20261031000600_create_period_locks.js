// One row per entity. Nothing dated on or before locked_through_date can
// be posted for that entity.
export async function up(knex) {
  return knex.schema.createTable("period_locks", (table) => {
    table.increments("period_lock_id");
    table
      .integer("entity_id")
      .notNullable()
      .unique()
      .references("entities.entity_id")
      .onDelete("RESTRICT");
    table.date("locked_through_date").notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTable("period_locks");
}
