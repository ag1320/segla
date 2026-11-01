import knex from "../dbConnection.js";

function findEntities(trx = knex) {
  return trx("entities").orderBy("name");
}

function findEntity(entityId, trx = knex) {
  return trx("entities").where({ entity_id: entityId }).first();
}

export { findEntities, findEntity };
