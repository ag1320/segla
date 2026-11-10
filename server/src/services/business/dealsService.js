import { findEntity } from "../../controllers/business/entitiesController.js";
import { findDeals, findDeal, insertDeal, updateDeal, deleteDeal } from "../../controllers/business/dealsController.js";
import { analyzeDeal } from "./dealAnalysis.js";
import { NotFoundError } from "../../utils/errors.js";

// Each saved deal with its numbers worked out from its assumptions.
async function listDeals(entityId) {
  await assertEntityExists(entityId);
  const deals = await findDeals(entityId);
  return deals.map(withAnalysis);
}

async function createDeal({ entityId, name, inputs }) {
  await assertEntityExists(entityId);
  return withAnalysis(await insertDeal({ entity_id: entityId, name, inputs }));
}

async function editDeal(dealId, { name, inputs }) {
  await getDeal(dealId);
  return withAnalysis(await updateDeal(dealId, { name, inputs }));
}

async function removeDeal(dealId) {
  await getDeal(dealId);
  await deleteDeal(dealId);
}

function withAnalysis(deal) {
  return { ...deal, analysis: analyzeDeal(deal.inputs) };
}

async function getDeal(dealId) {
  const deal = await findDeal(dealId);
  if (!deal) {
    throw new NotFoundError(`Deal ${dealId} not found`);
  }
  return deal;
}

async function assertEntityExists(entityId) {
  if (!(await findEntity(entityId))) {
    throw new NotFoundError(`Entity ${entityId} not found`);
  }
}

export { listDeals, createDeal, editDeal, removeDeal };
