import {
  findVendor,
  findVendorByName,
  insertVendor,
  updateVendor,
} from "../../controllers/business/vendorsController.js";
import { NotFoundError, ConflictError } from "../../utils/errors.js";

async function createVendor(details) {
  await assertNameFree(details.name);
  return insertVendor(toVendorColumns(details));
}

async function editVendor(vendorId, changes) {
  const vendor = await findVendor(vendorId);
  if (!vendor) {
    throw new NotFoundError(`Vendor ${vendorId} not found`);
  }
  if (changes.name !== undefined && changes.name !== vendor.name) {
    await assertNameFree(changes.name);
  }
  return updateVendor(vendorId, toVendorColumns(changes));
}

async function assertNameFree(name) {
  if (await findVendorByName(name)) {
    throw new ConflictError(`A vendor named "${name}" already exists`);
  }
}

function toVendorColumns({ name, is1099Eligible, hasW9OnFile, w9Location, isActive }) {
  return {
    name,
    is_1099_eligible: is1099Eligible,
    has_w9_on_file: hasW9OnFile,
    w9_location: w9Location,
    is_active: isActive,
  };
}

export { createVendor, editVendor };
