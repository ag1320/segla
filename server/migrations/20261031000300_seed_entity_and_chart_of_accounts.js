// Starting data the business module needs on every database. It lives in a
// migration rather than seeds/ because the server only runs migrations,
// and `knex seed:run` would also run initial_budget_categories.js, which
// deletes the budget categories.

const ENTITY = {
  name: "Gettemy Properties",
  entity_type: "sole_proprietorship",
};

const CHART_OF_ACCOUNTS = [
  { account_number: 1000, name: "Chase Business Checking", account_type: "asset" },
  { account_number: 1010, name: "Security Deposit Account", account_type: "asset", is_active: false },
  { account_number: 1100, name: "Mortgage Escrow", account_type: "asset" },
  { account_number: 1500, name: "Land", account_type: "asset" },
  { account_number: 1510, name: "Buildings", account_type: "asset" },
  { account_number: 1520, name: "Building Improvements", account_type: "asset" },
  { account_number: 1530, name: "Land Improvements (15-yr)", account_type: "asset" },
  { account_number: 1540, name: "Appliances & Furnishings (5-yr)", account_type: "asset" },
  { account_number: 1590, name: "Accumulated Depreciation", account_type: "contra_asset" },
  { account_number: 1600, name: "Startup & Pre-Service Costs", account_type: "asset" },
  { account_number: 1610, name: "Accumulated Amortization", account_type: "contra_asset" },
  { account_number: 1700, name: "Loan Costs", account_type: "asset" },

  { account_number: 2000, name: "WF Signify Business Card", account_type: "liability" },
  { account_number: 2100, name: "Tenant Security Deposits Held", account_type: "liability" },
  { account_number: 2200, name: "Mortgages", account_type: "liability" },

  { account_number: 3000, name: "Owner Contributions", account_type: "equity" },
  { account_number: 3100, name: "Owner Draws", account_type: "equity" },
  { account_number: 3900, name: "Retained Earnings", account_type: "equity" },

  { account_number: 4000, name: "Rental Income", account_type: "income", schedule_e_line: 3 },
  { account_number: 4010, name: "Fees & Other Tenant Charges", account_type: "income", schedule_e_line: 3 },
  { account_number: 4900, name: "Interest & Bank Bonuses", account_type: "income" },
  { account_number: 4910, name: "Card Rewards", account_type: "income" },

  { account_number: 5000, name: "Advertising", account_type: "expense", schedule_e_line: 5 },
  { account_number: 5010, name: "Auto & Travel", account_type: "expense", schedule_e_line: 6 },
  { account_number: 5020, name: "Cleaning & Maintenance", account_type: "expense", schedule_e_line: 7 },
  { account_number: 5030, name: "Commissions", account_type: "expense", schedule_e_line: 8 },
  { account_number: 5040, name: "Insurance", account_type: "expense", schedule_e_line: 9 },
  { account_number: 5050, name: "Legal & Professional Fees", account_type: "expense", schedule_e_line: 10 },
  { account_number: 5060, name: "Management Fees", account_type: "expense", schedule_e_line: 11 },
  { account_number: 5070, name: "Mortgage Interest", account_type: "expense", schedule_e_line: 12 },
  { account_number: 5080, name: "Other Interest", account_type: "expense", schedule_e_line: 13 },
  { account_number: 5090, name: "Repairs", account_type: "expense", schedule_e_line: 14 },
  { account_number: 5100, name: "Supplies", account_type: "expense", schedule_e_line: 15 },
  { account_number: 5110, name: "Property Taxes", account_type: "expense", schedule_e_line: 16 },
  { account_number: 5120, name: "Utilities", account_type: "expense", schedule_e_line: 17 },
  { account_number: 5130, name: "Depreciation & Amortization", account_type: "expense", schedule_e_line: 18 },
  { account_number: 5190, name: "Other Expenses", account_type: "expense", schedule_e_line: 19 },
];

export async function up(knex) {
  await knex("entities").insert(ENTITY);
  await knex("accounts").insert(CHART_OF_ACCOUNTS);
}

export async function down(knex) {
  const accountNumbers = CHART_OF_ACCOUNTS.map((account) => account.account_number);
  await knex("accounts").whereIn("account_number", accountNumbers).del();
  await knex("entities").where({ name: ENTITY.name }).del();
}
