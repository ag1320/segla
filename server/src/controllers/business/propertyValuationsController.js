import knex from "../dbConnection.js";

const VALUATION_COLUMNS = [
  "property_valuation_id",
  "property_id",
  knex.raw("to_char(valuation_date, 'YYYY-MM-DD') as valuation_date"),
  "value_cents",
  "source",
  "note",
  "created_at",
  "updated_at",
];

// Oldest first, the order a chart reads them.
function findValuations(propertyId, trx = knex) {
  return trx("property_valuations")
    .select(VALUATION_COLUMNS)
    .where({ property_id: propertyId })
    .orderBy("valuation_date");
}

function findValuation(valuationId, trx = knex) {
  return trx("property_valuations")
    .select(VALUATION_COLUMNS)
    .where({ property_valuation_id: valuationId })
    .first();
}

function findValuationOnDate({ propertyId, valuationDate }, trx = knex) {
  return trx("property_valuations")
    .select(VALUATION_COLUMNS)
    .where({ property_id: propertyId, valuation_date: valuationDate })
    .first();
}

async function insertValuation(valuation, trx = knex) {
  const [{ property_valuation_id }] = await trx("property_valuations")
    .insert(valuation)
    .returning("property_valuation_id");
  return findValuation(property_valuation_id, trx);
}

async function updateValuation(valuationId, changes, trx = knex) {
  await trx("property_valuations")
    .where({ property_valuation_id: valuationId })
    .update({ ...changes, updated_at: knex.fn.now() });
  return findValuation(valuationId, trx);
}

function deleteValuation(valuationId, trx = knex) {
  return trx("property_valuations")
    .where({ property_valuation_id: valuationId })
    .delete();
}

export {
  findValuations,
  findValuation,
  findValuationOnDate,
  insertValuation,
  updateValuation,
  deleteValuation,
};
