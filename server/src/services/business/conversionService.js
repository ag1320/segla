import knex from "../../controllers/dbConnection.js";
import { findProperty, updateProperty } from "../../controllers/business/propertiesController.js";
import { findAccountByNumber } from "../../controllers/business/accountsController.js";
import { insertFixedAsset } from "../../controllers/business/fixedAssetsController.js";
import { postJournalEntry } from "./postingService.js";
import { NotFoundError, ConflictError, ValidationError } from "../../utils/errors.js";

const LAND_ACCOUNT_NUMBER = 1500;
const BUILDING_ACCOUNT_NUMBER = 1510;
const ESCROW_ACCOUNT_NUMBER = 1100;
const MORTGAGES_ACCOUNT_NUMBER = 2200;
const OWNER_CONTRIBUTIONS_ACCOUNT_NUMBER = 3000;

// A personal residence becomes a rental. The IRS sets its depreciable
// basis at the lower of what you have in it (adjusted basis) or what it's
// worth that day, split between land (never depreciated) and building.
// conversion: { placedInServiceDate, adjustedBasisCents, fairMarketValueCents,
//   landPercent, mortgageBalanceCents, escrowBalanceCents }
async function previewConversion(propertyId, conversion) {
  const property = await getConvertibleProperty(propertyId);
  return buildConversion(property, conversion);
}

// One balanced entry brings the house, the mortgage and the escrow onto
// the business books; the difference is your equity moving in. The
// property becomes an active rental with land and building assets, so
// depreciation starts the same month.
async function convertProperty(propertyId, conversion) {
  const property = await getConvertibleProperty(propertyId);
  const plan = await buildConversion(property, conversion);

  return knex.transaction(async (trx) => {
    const entry = await postJournalEntry(
      {
        entityId: property.entity_id,
        entryDate: conversion.placedInServiceDate,
        memo: `${property.name} converted to a rental`,
        source: "system",
        lines: plan.lines.map((line) => ({
          accountId: line.account_id,
          propertyId,
          debitCents: line.debit_cents,
          creditCents: line.credit_cents,
        })),
      },
      trx,
    );
    await updateProperty(
      propertyId,
      {
        status: "active",
        placed_in_service_date: conversion.placedInServiceDate,
        land_basis_cents: plan.land_cents,
        building_basis_cents: plan.building_cents,
      },
      trx,
    );
    if (plan.land_cents > 0) {
      await insertFixedAsset(
        fixedAsset({ propertyId, name: "Land", assetClass: "land", cents: plan.land_cents, conversion }),
        trx,
      );
    }
    await insertFixedAsset(
      fixedAsset({ propertyId, name: "Building", assetClass: "building", cents: plan.building_cents, conversion }),
      trx,
    );
    return { ...plan, journal_entry_id: entry.journal_entry_id };
  });
}

async function getConvertibleProperty(propertyId) {
  const property = await findProperty(propertyId);
  if (!property) {
    throw new NotFoundError(`Property ${propertyId} not found`);
  }
  if (property.status !== "pre_rental") {
    throw new ConflictError(`${property.name} isn't a pre-rental property, so it can't be converted`);
  }
  return property;
}

async function buildConversion(property, conversion) {
  const { adjustedBasisCents, fairMarketValueCents, landPercent, mortgageBalanceCents, escrowBalanceCents } =
    conversion;
  const basisCents = Math.min(adjustedBasisCents, fairMarketValueCents);
  const landCents = Math.round((basisCents * landPercent) / 100);
  const buildingCents = basisCents - landCents;
  if (buildingCents <= 0) {
    throw new ValidationError("The building's share must be more than zero");
  }
  const contributionCents = basisCents + escrowBalanceCents - mortgageBalanceCents;

  const [land, building, escrow, mortgages, contributions] = await Promise.all(
    [
      LAND_ACCOUNT_NUMBER,
      BUILDING_ACCOUNT_NUMBER,
      ESCROW_ACCOUNT_NUMBER,
      MORTGAGES_ACCOUNT_NUMBER,
      OWNER_CONTRIBUTIONS_ACCOUNT_NUMBER,
    ].map((number) => findAccountByNumber(number)),
  );
  const debit = (account, cents) => ({ account_id: account.account_id, debit_cents: cents, credit_cents: 0 });
  const credit = (account, cents) => ({ account_id: account.account_id, debit_cents: 0, credit_cents: cents });

  // An escrow deficit (the servicer paid out more than it holds) is owed,
  // and an underwater house (owing more than its basis) takes equity out
  // instead of putting it in, so those lines flip sides.
  const lines = [
    landCents > 0 && debit(land, landCents),
    debit(building, buildingCents),
    escrowBalanceCents > 0 && debit(escrow, escrowBalanceCents),
    escrowBalanceCents < 0 && credit(escrow, -escrowBalanceCents),
    mortgageBalanceCents > 0 && credit(mortgages, mortgageBalanceCents),
    contributionCents > 0 && credit(contributions, contributionCents),
    contributionCents < 0 && debit(contributions, -contributionCents),
  ].filter(Boolean);

  return {
    property_id: property.property_id,
    basis_cents: basisCents,
    basis_source: adjustedBasisCents <= fairMarketValueCents ? "adjusted_basis" : "fair_market_value",
    land_cents: landCents,
    building_cents: buildingCents,
    contribution_cents: contributionCents,
    lines,
  };
}

function fixedAsset({ propertyId, name, assetClass, cents, conversion }) {
  return {
    property_id: propertyId,
    name,
    asset_class: assetClass,
    cost_cents: cents,
    in_service_date: conversion.placedInServiceDate,
  };
}

export { previewConversion, convertProperty };
