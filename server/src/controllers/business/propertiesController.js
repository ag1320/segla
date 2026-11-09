import knex from "../dbConnection.js";

// Dates come back as 'YYYY-MM-DD' strings. Without to_char, pg turns a date
// into a JS Date at local midnight, which can shift it by a day.
const PROPERTY_COLUMNS = [
  "property_id",
  "entity_id",
  "name",
  "address",
  "status",
  knex.raw("to_char(target_conversion_date, 'YYYY-MM-DD') as target_conversion_date"),
  knex.raw("to_char(placed_in_service_date, 'YYYY-MM-DD') as placed_in_service_date"),
  "land_basis_cents",
  "building_basis_cents",
  "market_rent_cents",
  "created_at",
  "updated_at",
];

function findProperties(trx = knex) {
  return trx("properties").select(PROPERTY_COLUMNS).orderBy("name");
}

function findProperty(propertyId, trx = knex) {
  return trx("properties")
    .select(PROPERTY_COLUMNS)
    .where({ property_id: propertyId })
    .first();
}

function findPropertyByName(name, trx = knex) {
  return trx("properties").select(PROPERTY_COLUMNS).where({ name }).first();
}

function findPropertiesByIds(propertyIds, trx = knex) {
  return trx("properties")
    .select(PROPERTY_COLUMNS)
    .whereIn("property_id", propertyIds);
}

async function insertProperty(property, trx = knex) {
  const [{ property_id }] = await trx("properties")
    .insert(property)
    .returning("property_id");
  return findProperty(property_id, trx);
}

async function updateProperty(propertyId, changes, trx = knex) {
  await trx("properties")
    .where({ property_id: propertyId })
    .update({ ...changes, updated_at: knex.fn.now() });
  return findProperty(propertyId, trx);
}

export {
  findProperties,
  findProperty,
  findPropertyByName,
  findPropertiesByIds,
  insertProperty,
  updateProperty,
};
