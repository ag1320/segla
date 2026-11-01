import knex from "../dbConnection.js";

async function findLockedThroughDate(entityId, trx = knex) {
  const lock = await trx("period_locks")
    .select(knex.raw("to_char(locked_through_date, 'YYYY-MM-DD') as locked_through_date"))
    .where({ entity_id: entityId })
    .first();
  return lock?.locked_through_date ?? null;
}

export { findLockedThroughDate };
