// A tenant's lease. Not a ledger record: rent and deposits post through the
// Inbox like any money in or out. Whether a lease is upcoming, active or
// ended comes from its dates, so it's never stored.
export async function up(knex) {
  return knex.schema.createTable("leases", (table) => {
    table.increments("lease_id");
    table
      .integer("property_id")
      .notNullable()
      .references("properties.property_id")
      .onDelete("RESTRICT");
    table.string("tenant_name").notNullable();
    // For a property with more than one unit, e.g. "A" or "Upstairs".
    table.string("unit");
    table.date("start_date").notNullable();
    // Blank for month-to-month.
    table.date("end_date");
    table.date("move_out_date");
    table.bigInteger("monthly_rent_cents").notNullable();
    table.bigInteger("deposit_cents").notNullable().defaultTo(0);
    table.check("?? > 0", ["monthly_rent_cents"]);
    table.check("?? >= 0", ["deposit_cents"]);
    table.check("?? is null or ?? >= ??", ["end_date", "end_date", "start_date"]);
    table.check("?? is null or ?? >= ??", ["move_out_date", "move_out_date", "start_date"]);
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTable("leases");
}
