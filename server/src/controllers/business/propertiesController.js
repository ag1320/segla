import knex from "../dbConnection.js";

function findPropertiesByIds(propertyIds, trx = knex) {
  return trx("properties").whereIn("property_id", propertyIds);
}

export { findPropertiesByIds };
