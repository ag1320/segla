import { findEntity, updateEntity } from "../../controllers/business/entitiesController.js";
import { findProperties, findProperty } from "../../controllers/business/propertiesController.js";
import { findAccount } from "../../controllers/business/accountsController.js";
import {
  findCapexComponents,
  findCapexComponent,
  insertCapexComponent,
  updateCapexComponent,
  deleteCapexComponent,
} from "../../controllers/business/capexComponentsController.js";
import { findAccountTotals } from "../../controllers/business/reportsController.js";
import { ValidationError, NotFoundError } from "../../utils/errors.js";

const FORECAST_YEARS = 10;

async function createCapexComponent({ propertyId, ...details }) {
  if (!(await findProperty(propertyId))) {
    throw new NotFoundError(`Property ${propertyId} not found`);
  }
  return insertCapexComponent({ property_id: propertyId, ...toComponentColumns(details) });
}

async function editCapexComponent(capexComponentId, changes) {
  await getCapexComponent(capexComponentId);
  return updateCapexComponent(capexComponentId, toComponentColumns(changes));
}

async function removeCapexComponent(capexComponentId) {
  await getCapexComponent(capexComponentId);
  await deleteCapexComponent(capexComponentId);
}

// accountId null means no reserve account yet.
async function setCapexReserveAccount(entityId, accountId) {
  if (!(await findEntity(entityId))) {
    throw new NotFoundError(`Entity ${entityId} not found`);
  }
  if (accountId !== null) {
    const account = await findAccount(accountId);
    if (!account) {
      throw new NotFoundError(`Account ${accountId} not found`);
    }
    if (account.account_type !== "asset") {
      throw new ValidationError("The reserve has to be held in an asset (cash) account");
    }
  }
  await updateEntity(entityId, { capex_reserve_account_id: accountId });
}

// The reserve plan on asOfDate. Each component should have saved toward
// its replacement in proportion to how much of its life is used up:
// target = cost × age ÷ life. Setting aside cost ÷ life every year keeps
// pace. The forecast lists the replacements due in each of the next ten
// years against the reserve growing at that yearly pace.
async function getCapexPlan({ entityId, asOfDate }) {
  const entity = await findEntity(entityId);
  if (!entity) {
    throw new NotFoundError(`Entity ${entityId} not found`);
  }
  const year = Number(asOfDate.slice(0, 4));
  const [properties, components, reserveCents] = await Promise.all([
    findProperties(),
    findCapexComponents({ entityId }),
    reserveBalance(entity, asOfDate),
  ]);
  const propertyNames = Object.fromEntries(properties.map((property) => [property.property_id, property.name]));

  const planned = components.map((component) => ({
    ...component,
    property_name: propertyNames[component.property_id],
    ...componentPlan(component, year),
  }));
  const targetCents = sum(planned, "target_cents");
  const annualContributionCents = sum(planned, "annual_contribution_cents");

  let projectedCents = reserveCents ?? 0;
  const forecast = Array.from({ length: FORECAST_YEARS }, (_, index) => {
    const forecastYear = year + index;
    const due = planned.filter((component) => isDueIn(component, forecastYear));
    const replacementsCents = sum(due, "replacement_cost_cents");
    // This year's contribution is still to come only for the rest of it.
    projectedCents += (index === 0 ? 0 : annualContributionCents) - replacementsCents;
    return {
      year: forecastYear,
      components: due.map((component) => ({
        capex_component_id: component.capex_component_id,
        name: component.name,
        property_id: component.property_id,
        replacement_cost_cents: component.replacement_cost_cents,
      })),
      replacements_cents: replacementsCents,
      projected_reserve_cents: projectedCents,
    };
  });

  return {
    entity_id: entityId,
    as_of_date: asOfDate,
    reserve_account_id: entity.capex_reserve_account_id,
    reserve_cents: reserveCents,
    target_cents: targetCents,
    funded_ratio: reserveCents !== null && targetCents > 0 ? reserveCents / targetCents : null,
    annual_contribution_cents: annualContributionCents,
    components: planned,
    forecast,
  };
}

function componentPlan(component, year) {
  const life = component.useful_life_years;
  const age = Math.max(year - component.install_year, 0);
  // Past its life and not yet replaced: due now.
  const nextReplacementYear = Math.max(component.install_year + life, year);
  return {
    age_years: age,
    next_replacement_year: nextReplacementYear,
    target_cents: Math.round((component.replacement_cost_cents * Math.min(age, life)) / life),
    annual_contribution_cents: Math.round(component.replacement_cost_cents / life),
  };
}

// Due in its next replacement year and every `life` years after.
function isDueIn(component, year) {
  const yearsPast = year - component.next_replacement_year;
  return yearsPast >= 0 && yearsPast % component.useful_life_years === 0;
}

// The reserve account's balance in the books, or null when none is set.
async function reserveBalance(entity, asOfDate) {
  if (entity.capex_reserve_account_id === null) {
    return null;
  }
  const totals = await findAccountTotals({ entityId: entity.entity_id, to: asOfDate });
  const row = totals.find((total) => total.account_id === entity.capex_reserve_account_id);
  return row ? row.debit_cents - row.credit_cents : 0;
}

async function getCapexComponent(capexComponentId) {
  const component = await findCapexComponent(capexComponentId);
  if (!component) {
    throw new NotFoundError(`Capex component ${capexComponentId} not found`);
  }
  return component;
}

function toComponentColumns({ name, installYear, usefulLifeYears, replacementCostCents }) {
  return {
    name,
    install_year: installYear,
    useful_life_years: usefulLifeYears,
    replacement_cost_cents: replacementCostCents,
  };
}

function sum(items, field) {
  return items.reduce((total, item) => total + item[field], 0);
}

export {
  createCapexComponent,
  editCapexComponent,
  removeCapexComponent,
  setCapexReserveAccount,
  getCapexPlan,
};
