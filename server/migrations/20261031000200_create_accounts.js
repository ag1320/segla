const ACCOUNT_TYPES = [
  "asset",
  "contra_asset",
  "liability",
  "equity",
  "income",
  "expense",
];

export async function up(knex) {
  return knex.schema.createTable("accounts", (table) => {
    table.increments("account_id");
    table.integer("account_number").notNullable().unique();
    table.string("name").notNullable();
    table.string("account_type").notNullable().checkIn(ACCOUNT_TYPES);
    table
      .integer("parent_account_id")
      .references("accounts.account_id")
      .onDelete("RESTRICT");
    // Blank means the account isn't reported on Schedule E.
    table.integer("schedule_e_line").checkBetween([3, 19]);
    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTable("accounts");
}
