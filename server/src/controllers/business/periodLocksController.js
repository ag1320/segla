import knex from "../dbConnection.js";

async function findLockedThroughDate(entityId, trx = knex) {
  const lock = await trx("period_locks")
    .select(knex.raw("to_char(locked_through_date, 'YYYY-MM-DD') as locked_through_date"))
    .where({ entity_id: entityId })
    .first();
  return lock?.locked_through_date ?? null;
}

function saveLockedThroughDate(entityId, lockedThroughDate, trx = knex) {
  return trx("period_locks")
    .insert({ entity_id: entityId, locked_through_date: lockedThroughDate })
    .onConflict("entity_id")
    .merge({ locked_through_date: lockedThroughDate, updated_at: knex.fn.now() });
}

function deletePeriodLock(entityId, trx = knex) {
  return trx("period_locks").where({ entity_id: entityId }).delete();
}

export { findLockedThroughDate, saveLockedThroughDate, deletePeriodLock };
