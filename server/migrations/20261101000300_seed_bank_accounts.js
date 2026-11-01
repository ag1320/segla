// The two accounts imported from CSV. Like the chart of accounts, this is a
// migration rather than a seed so every database gets it.

const ENTITY_NAME = "Gettemy Properties";

const BANK_ACCOUNTS = [
  {
    name: "Chase Business Checking",
    institution: "Chase",
    account_number: 1000,
    import_format: "chase_checking",
  },
  {
    name: "WF Signify Business Card",
    institution: "Wells Fargo",
    account_number: 2000,
    import_format: "wells_fargo_card",
  },
];

export async function up(knex) {
  const entity = await knex("entities").where({ name: ENTITY_NAME }).first();
  for (const { account_number, ...bankAccount } of BANK_ACCOUNTS) {
    const account = await knex("accounts").where({ account_number }).first();
    await knex("bank_accounts").insert({
      ...bankAccount,
      entity_id: entity.entity_id,
      account_id: account.account_id,
    });
  }
}

export async function down(knex) {
  const names = BANK_ACCOUNTS.map((bankAccount) => bankAccount.name);
  await knex("bank_accounts").whereIn("name", names).del();
}
