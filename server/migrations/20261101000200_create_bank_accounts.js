const IMPORT_FORMATS = ["chase_checking", "wells_fargo_card"];

export async function up(knex) {
  return knex.schema.createTable("bank_accounts", (table) => {
    table.increments("bank_account_id");
    table
      .integer("entity_id")
      .notNullable()
      .references("entities.entity_id")
      .onDelete("RESTRICT");
    // The ledger account this bank account's activity posts to.
    table
      .integer("account_id")
      .notNullable()
      .unique()
      .references("accounts.account_id")
      .onDelete("RESTRICT");
    table.string("name").notNullable().unique();
    table.string("institution").notNullable();
    table.string("last_four", 4);
    table.check("?? ~ '^[0-9]{4}$'", ["last_four"], "bank_accounts_last_four_digits");
    // Which CSV parser reads this account's downloads. Blank means the
    // account isn't imported (escrow is entered from its statement).
    table.string("import_format").checkIn(IMPORT_FORMATS);
    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTable("bank_accounts");
}
