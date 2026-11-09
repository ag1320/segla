import knex from "../../controllers/dbConnection.js";
import { postJournalEntry } from "./postingService.js";
import {
  getPreRentalProperty,
  accountIdsByNumber,
  debitLine,
  creditLine,
  toPostingLines,
  splitBasis,
  placeInService,
} from "./placeInService.js";

const LAND = 1500;
const BUILDING = 1510;
const ESCROW = 1100;
const MORTGAGES = 2200;
const OWNER_CONTRIBUTIONS = 3000;

// A personal residence becomes a rental. The IRS sets its depreciable
// basis at the lower of what you have in it (adjusted basis) or what it's
// worth that day, split between land (never depreciated) and building.
// conversion: { placedInServiceDate, adjustedBasisCents, fairMarketValueCents,
//   landPercent, mortgageBalanceCents, escrowBalanceCents }
async function previewConversion(propertyId, conversion) {
  const property = await getPreRentalProperty(propertyId, "converted");
  return buildConversion(property, conversion);
}

// One balanced entry brings the house, the mortgage and the escrow onto
// the business books; the difference is your equity moving in.
async function convertProperty(propertyId, conversion) {
  const property = await getPreRentalProperty(propertyId, "converted");
  const plan = await buildConversion(property, conversion);

  return knex.transaction(async (trx) => {
    const entry = await postJournalEntry(
      {
        entityId: property.entity_id,
        entryDate: conversion.placedInServiceDate,
        memo: `${property.name} converted to a rental`,
        source: "system",
        lines: toPostingLines(plan.lines, propertyId),
      },
      trx,
    );
    await placeInService(
      {
        propertyId,
        inServiceDate: conversion.placedInServiceDate,
        landCents: plan.land_cents,
        buildingCents: plan.building_cents,
      },
      trx,
    );
    return { ...plan, journal_entry_id: entry.journal_entry_id };
  });
}

async function buildConversion(property, conversion) {
  const { adjustedBasisCents, fairMarketValueCents, landPercent, mortgageBalanceCents, escrowBalanceCents } =
    conversion;
  const basisCents = Math.min(adjustedBasisCents, fairMarketValueCents);
  const { landCents, buildingCents } = splitBasis(basisCents, landPercent);
  const contributionCents = basisCents + escrowBalanceCents - mortgageBalanceCents;
  const ids = await accountIdsByNumber([LAND, BUILDING, ESCROW, MORTGAGES, OWNER_CONTRIBUTIONS]);

  // An escrow deficit (the servicer paid out more than it holds) is owed,
  // and an underwater house (owing more than its basis) takes equity out
  // instead of putting it in, so those lines flip sides.
  const lines = [
    debitLine(ids[LAND], landCents),
    debitLine(ids[BUILDING], buildingCents),
    debitLine(ids[ESCROW], escrowBalanceCents),
    creditLine(ids[ESCROW], -escrowBalanceCents),
    creditLine(ids[MORTGAGES], mortgageBalanceCents),
    creditLine(ids[OWNER_CONTRIBUTIONS], contributionCents),
    debitLine(ids[OWNER_CONTRIBUTIONS], -contributionCents),
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

export { previewConversion, convertProperty };
