// Split out of 20220109173748_create_monthly_expenses.js (2026-09-10) -
// that migration tried to add this same foreign key before
// budget_categories_snapshot existed (created 3 months later,
// 20220412153429_create_budget_categories_snapshot.js), which fails
// outright on a fresh database. See that file's comment for the story.
export async function up(knex) {
  return knex.schema.alterTable("monthly_expenses", (table) => {
    table
      .foreign("category_id")
      .references("budget_categories_snapshot.budget_categories_snapshot_id");
  });
}

export async function down(knex) {
  return knex.schema.alterTable("monthly_expenses", (table) => {
    table.dropForeign("category_id");
  });
}
