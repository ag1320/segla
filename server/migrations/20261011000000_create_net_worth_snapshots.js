// Point-in-time record of assets/liabilities/net worth. Every other asset
// table only ever holds the *current* value (rows get PATCHed in place), so
// this is the only place history lives. One row per calendar day - repeat
// captures on the same day overwrite that day's row (see
// netWorthController.captureSnapshot).
//
// The per-category columns mirror Home.js / HomeSummary.js's donut inputs so
// the history can be broken down the same way the dashboard is.
export async function up(knex) {
  const exists = await knex.schema.hasTable("net_worth_snapshots");
  if (exists) return;
  return knex.schema.createTable("net_worth_snapshots", (table) => {
    table.increments("snapshot_id");
    table.date("snapshot_date").notNullable().unique();

    // Assets
    table.decimal("retirement", 12, 2).notNullable().defaultTo(0);
    table.decimal("brokerage", 12, 2).notNullable().defaultTo(0);
    table.decimal("college", 12, 2).notNullable().defaultTo(0);
    table.decimal("crypto", 12, 2).notNullable().defaultTo(0);
    table.decimal("emergency", 12, 2).notNullable().defaultTo(0);
    table.decimal("house", 12, 2).notNullable().defaultTo(0);

    // Liabilities
    table.decimal("mortgage", 12, 2).notNullable().defaultTo(0);
    table.decimal("student_loan", 12, 2).notNullable().defaultTo(0);
    table.decimal("auto_loan", 12, 2).notNullable().defaultTo(0);

    // Totals - derivable from the columns above, but stored so the history
    // stays correct even if the category mix changes later.
    table.decimal("total_assets", 12, 2).notNullable().defaultTo(0);
    table.decimal("total_liabilities", 12, 2).notNullable().defaultTo(0);
    table.decimal("net_worth", 12, 2).notNullable().defaultTo(0);

    // "manual" (Capture Now button), "auto" (an asset/loan was edited), or
    // "scheduled" (monthly floor - see ensureMonthlySnapshot)
    table.string("source").notNullable().defaultTo("auto");
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("net_worth_snapshots");
}
