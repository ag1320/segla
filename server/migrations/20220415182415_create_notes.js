exports.up = function (knex) {
  return knex.schema.createTable("notes", async (table) => {
    table.increments("note_id");
    table.string("title")
    table.string("details")
    table.string('month')
    table.string('year')
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("notes");
};
