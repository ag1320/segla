import { findEntity } from "../../controllers/business/entitiesController.js";
import {
  findProperty,
  findPropertyByName,
  insertProperty,
  updateProperty,
} from "../../controllers/business/propertiesController.js";
import { NotFoundError, ConflictError } from "../../utils/errors.js";

async function createProperty({ entityId, ...details }) {
  if (!(await findEntity(entityId))) {
    throw new NotFoundError(`Entity ${entityId} not found`);
  }
  await assertNameFree(details.name);

  return insertProperty({ entity_id: entityId, ...toPropertyColumns(details) });
}

// A property can't move to another entity: its posted lines belong to the
// entity it started in.
async function editProperty(propertyId, changes) {
  const property = await findProperty(propertyId);
  if (!property) {
    throw new NotFoundError(`Property ${propertyId} not found`);
  }
  if (changes.name !== undefined && changes.name !== property.name) {
    await assertNameFree(changes.name);
  }

  return updateProperty(propertyId, toPropertyColumns(changes));
}

async function assertNameFree(name) {
  if (await findPropertyByName(name)) {
    throw new ConflictError(`A property named "${name}" already exists`);
  }
}

function toPropertyColumns({
  name,
  address,
  status,
  targetConversionDate,
  placedInServiceDate,
  landBasisCents,
  buildingBasisCents,
}) {
  return {
    name,
    address,
    status,
    target_conversion_date: targetConversionDate,
    placed_in_service_date: placedInServiceDate,
    land_basis_cents: landBasisCents,
    building_basis_cents: buildingBasisCents,
  };
}

export { createProperty, editProperty };
