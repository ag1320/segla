export async function up(knex) {
  return knex.schema.createTable("monthly_expenses", async (table) => {
    table.increments("monthly_expenses_id");
    table.string("category")
    table.string("type")
    table.decimal("amount", 8, 2);
    table.string('month');
    table.integer('year')
    table.integer('category_id')
    // The foreign key to budget_categories_snapshot was here, but that
    // table isn't created until a later migration
    // (20220412153429_create_budget_categories_snapshot.js) - referencing
    // it here fails outright on a truly fresh database (confirmed on
    // VM1's first deploy, 2026-09-10: "relation budget_categories_snapshot
    // does not exist"). This only ever worked on existing dev databases
    // because the migration was already recorded as applied there from
    // before this line was added, so it never actually re-ran. Moved to
    // 20260910000000_add_monthly_expenses_category_fk.js, which runs after
    // budget_categories_snapshot actually exists.
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("monthly_expenses");
}
