// Split out of 20220109173748_create_monthly_expenses.js (2026-09-10) -
// that migration tried to add this same foreign key before
// budget_categories_snapshot existed (created 3 months later,
// 20220412153429_create_budget_categories_snapshot.js), which fails
// outright on a fresh database. See that file's comment for the story.
//
// Guarded with an existence check (2026-09-12) - any database whose data
// predates this split (i.e. was created back when the FK lived inline in
// the original migration, then dumped/restored) already has this exact
// constraint from that original run. knex has no record of *this* file
// having run against such a database, since the file didn't exist yet
// when that migration history was written, so `migrate:latest` retries it
// forever, and Postgres rejects the duplicate ADD CONSTRAINT every time -
// confirmed hitting this for real on VM1 post-restore, server stuck in a
// permanent restart loop (not the transient race restart:unless-stopped
// already covers). Postgres has no `ADD CONSTRAINT IF NOT EXISTS`, so the
// check is manual.
export async function up(knex) {
  const { rows } = await knex.raw(
    `select 1 from information_schema.table_constraints
     where constraint_name = 'monthly_expenses_category_id_foreign'`
  );
  if (rows.length > 0) return;
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
