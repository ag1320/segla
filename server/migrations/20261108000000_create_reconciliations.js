// One row per bank or card statement that has been matched to the ledger.
// statement_balance_cents is the statement's ending balance on the
// account's normal side: cash in checking, or the amount owed on a card.
export async function up(knex) {
  await knex.schema.createTable("reconciliations", (table) => {
    table.increments("reconciliation_id");
    table
      .integer("bank_account_id")
      .notNullable()
      .references("bank_accounts.bank_account_id")
      .onDelete("RESTRICT");
    table.date("statement_date").notNullable();
    table.bigInteger("statement_balance_cents").notNullable();
    table.unique(["bank_account_id", "statement_date"]);
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTable("reconciliations");
}
