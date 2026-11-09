import knex from "../dbConnection.js";

const LEASE_COLUMNS = [
  "leases.lease_id",
  "leases.property_id",
  "leases.tenant_name",
  "leases.unit",
  knex.raw("to_char(leases.start_date, 'YYYY-MM-DD') as start_date"),
  knex.raw("to_char(leases.end_date, 'YYYY-MM-DD') as end_date"),
  knex.raw("to_char(leases.move_out_date, 'YYYY-MM-DD') as move_out_date"),
  "leases.monthly_rent_cents",
  "leases.deposit_cents",
  "leases.created_at",
  "leases.updated_at",
];

// entityId (optional) keeps the leases of that entity's properties.
function findLeases({ entityId } = {}, trx = knex) {
  return trx("leases")
    .select(LEASE_COLUMNS)
    .modify((query) => {
      if (entityId) {
        query
          .join("properties", "properties.property_id", "leases.property_id")
          .where("properties.entity_id", entityId);
      }
    })
    .orderBy([{ column: "leases.start_date", order: "desc" }, { column: "leases.lease_id" }]);
}

function findLease(leaseId, trx = knex) {
  return trx("leases").select(LEASE_COLUMNS).where("leases.lease_id", leaseId).first();
}

async function insertLease(lease, trx = knex) {
  const [{ lease_id }] = await trx("leases").insert(lease).returning("lease_id");
  return findLease(lease_id, trx);
}

async function updateLease(leaseId, changes, trx = knex) {
  await trx("leases")
    .where({ lease_id: leaseId })
    .update({ ...changes, updated_at: knex.fn.now() });
  return findLease(leaseId, trx);
}

function deleteLease(leaseId, trx = knex) {
  return trx("leases").where({ lease_id: leaseId }).delete();
}

export { findLeases, findLease, insertLease, updateLease, deleteLease };
