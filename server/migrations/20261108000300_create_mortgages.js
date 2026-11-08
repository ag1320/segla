// A fixed-rate mortgage on one property. The amortization schedule is
// computed from these terms, never stored. Payments post to the ledger
// like any other bank transaction; this table only pre-fills their split.
export async function up(knex) {
  return knex.schema.createTable("mortgages", (table) => {
    table.increments("mortgage_id");
    table
      .integer("property_id")
      .notNullable()
      .references("properties.property_id")
      .onDelete("RESTRICT");
    table.string("lender").notNullable();
    table.bigInteger("original_principal_cents").notNullable();
    // A yearly percentage: 2.75 means 2.75%.
    table.decimal("annual_rate_percent", 6, 4).notNullable();
    table.integer("term_months").notNullable();
    table.date("first_payment_date").notNullable();
    // The escrow part of each payment (taxes and insurance), which changes
    // when the servicer reruns its yearly escrow analysis.
    table.bigInteger("monthly_escrow_cents").notNullable().defaultTo(0);
    table
      .integer("liability_account_id")
      .notNullable()
      .references("accounts.account_id")
      .onDelete("RESTRICT");
    table.check("?? > 0", ["original_principal_cents"]);
    table.check("?? >= 0", ["annual_rate_percent"]);
    table.check("?? > 0", ["term_months"]);
    table.check("?? >= 0", ["monthly_escrow_cents"]);
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTable("mortgages");
}
