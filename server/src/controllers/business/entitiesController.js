import knex from "../dbConnection.js";

function findEntity(entityId, trx = knex) {
  return trx("entities").where({ entity_id: entityId }).first();
}

export { findEntity };
