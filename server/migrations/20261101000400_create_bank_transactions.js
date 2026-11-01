const TRANSACTION_STATUSES = ["new", "posted", "excluded"];

export async function up(knex) {
  return knex.schema.createTable("bank_transactions", (table) => {
    table.increments("bank_transaction_id");
    table
      .integer("bank_account_id")
      .notNullable()
      .references("bank_accounts.bank_account_id")
      .onDelete("RESTRICT");
    table.date("transaction_date").notNullable();
    table.text("description").notNullable();
    // Signed from the account's point of view: positive is money in (a
    // deposit, a card payment or refund), negative is money out.
    table.bigInteger("amount_cents").notNullable();
    table.check("?? <> 0", ["amount_cents"], "bank_transactions_amount_not_zero");
    // Identifies a CSV row so re-importing the same file adds nothing.
    table.string("dedupe_hash").notNullable();
    table.unique(["bank_account_id", "dedupe_hash"]);
    // The row exactly as it appeared in the CSV.
    table.jsonb("csv_row").notNullable();
    table
      .string("status")
      .notNullable()
      .defaultTo("new")
      .checkIn(TRANSACTION_STATUSES);
    // Not unique: a transfer between two bank accounts posts both sides
    // as one entry.
    table
      .integer("journal_entry_id")
      .references("journal_entries.journal_entry_id")
      .onDelete("RESTRICT");
    table.check(
      "(status = 'posted') = (journal_entry_id is not null)",
      [],
      "bank_transactions_posted_has_entry",
    );
    table.index(["bank_account_id", "status"]);
    table.index("journal_entry_id");
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTable("bank_transactions");
}
