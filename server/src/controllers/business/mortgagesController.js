import knex from "../dbConnection.js";

const MORTGAGE_COLUMNS = [
  "mortgage_id",
  "property_id",
  "lender",
  "original_principal_cents",
  "annual_rate_percent",
  "term_months",
  knex.raw("to_char(first_payment_date, 'YYYY-MM-DD') as first_payment_date"),
  "monthly_escrow_cents",
  "liability_account_id",
  "created_at",
  "updated_at",
];

function findMortgages(trx = knex) {
  return trx("mortgages").select(MORTGAGE_COLUMNS).orderBy("mortgage_id");
}

function findMortgage(mortgageId, trx = knex) {
  return trx("mortgages").select(MORTGAGE_COLUMNS).where({ mortgage_id: mortgageId }).first();
}

async function insertMortgage(mortgage, trx = knex) {
  const [{ mortgage_id }] = await trx("mortgages").insert(mortgage).returning("mortgage_id");
  return findMortgage(mortgage_id, trx);
}

async function updateMortgage(mortgageId, changes, trx = knex) {
  await trx("mortgages")
    .where({ mortgage_id: mortgageId })
    .update({ ...changes, updated_at: knex.fn.now() });
  return findMortgage(mortgageId, trx);
}

function deleteMortgage(mortgageId, trx = knex) {
  return trx("mortgages").where({ mortgage_id: mortgageId }).delete();
}

export { findMortgages, findMortgage, insertMortgage, updateMortgage, deleteMortgage };
