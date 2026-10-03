// Flags "nice-to-have" fixed expenses (Audible, Prime, Nintendo Online...)
// that could be cancelled at any time, as opposed to essentials like
// internet or utilities. Stored on every owner row of a category and kept
// in sync by the fixedExpenses PATCH/POST routes.
export async function up(knex) {
  const exists = await knex.schema.hasColumn("fixed_expenses", "is_discretionary");
  if (exists) return;
  return knex.schema.alterTable("fixed_expenses", (table) => {
    table.boolean("is_discretionary").notNullable().defaultTo(false);
  });
}

export async function down(knex) {
  return knex.schema.alterTable("fixed_expenses", (table) => {
    table.dropColumn("is_discretionary");
  });
}
