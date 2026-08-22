export async function up(knex) {
  return knex.schema.createTable("notes", async (table) => {
    table.increments("note_id");
    table.string("title")
    table.string("details")
    table.string('month')
    table.string('year')
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("notes");
}
