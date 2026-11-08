import { findProperty } from "../../controllers/business/propertiesController.js";
import {
  findValuations,
  findValuation,
  findValuationOnDate,
  insertValuation,
  updateValuation,
  deleteValuation,
} from "../../controllers/business/propertyValuationsController.js";
import { NotFoundError, ConflictError } from "../../utils/errors.js";

async function listValuations(propertyId) {
  await assertPropertyExists(propertyId);
  return findValuations(propertyId);
}

async function createValuation({ propertyId, valuationDate, valueCents, source, note }) {
  await assertPropertyExists(propertyId);
  await assertDateFree({ propertyId, valuationDate });

  return insertValuation({
    property_id: propertyId,
    valuation_date: valuationDate,
    value_cents: valueCents,
    source,
    note,
  });
}

async function editValuation(valuationId, { valuationDate, valueCents, source, note }) {
  const valuation = await findValuation(valuationId);
  if (!valuation) {
    throw new NotFoundError(`Valuation ${valuationId} not found`);
  }
  if (valuationDate !== undefined && valuationDate !== valuation.valuation_date) {
    await assertDateFree({ propertyId: valuation.property_id, valuationDate });
  }

  return updateValuation(valuationId, {
    valuation_date: valuationDate,
    value_cents: valueCents,
    source,
    note,
  });
}

async function removeValuation(valuationId) {
  if (!(await findValuation(valuationId))) {
    throw new NotFoundError(`Valuation ${valuationId} not found`);
  }
  await deleteValuation(valuationId);
}

async function assertPropertyExists(propertyId) {
  if (!(await findProperty(propertyId))) {
    throw new NotFoundError(`Property ${propertyId} not found`);
  }
}

// One value per property per day keeps the history chart unambiguous.
async function assertDateFree({ propertyId, valuationDate }) {
  if (await findValuationOnDate({ propertyId, valuationDate })) {
    throw new ConflictError(`This property already has a valuation on ${valuationDate}`);
  }
}

export { listValuations, createValuation, editValuation, removeValuation };
