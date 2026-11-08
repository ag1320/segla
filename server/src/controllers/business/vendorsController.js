import knex from "../dbConnection.js";

function findVendors(trx = knex) {
  return trx("vendors").orderBy("name");
}

function findVendor(vendorId, trx = knex) {
  return trx("vendors").where({ vendor_id: vendorId }).first();
}

function findVendorByName(name, trx = knex) {
  return trx("vendors").where({ name }).first();
}

function findVendorsByIds(vendorIds, trx = knex) {
  return trx("vendors").whereIn("vendor_id", vendorIds);
}

async function insertVendor(vendor, trx = knex) {
  const [inserted] = await trx("vendors").insert(vendor).returning("*");
  return inserted;
}

async function updateVendor(vendorId, changes, trx = knex) {
  const [updated] = await trx("vendors")
    .where({ vendor_id: vendorId })
    .update({ ...changes, updated_at: knex.fn.now() })
    .returning("*");
  return updated;
}

export {
  findVendors,
  findVendor,
  findVendorByName,
  findVendorsByIds,
  insertVendor,
  updateVendor,
};
