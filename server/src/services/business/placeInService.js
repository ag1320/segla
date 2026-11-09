import { findProperty, updateProperty } from "../../controllers/business/propertiesController.js";
import { findAccountByNumber } from "../../controllers/business/accountsController.js";
import { insertFixedAsset } from "../../controllers/business/fixedAssetsController.js";
import { ValidationError, NotFoundError, ConflictError } from "../../utils/errors.js";

// Conversions and acquisitions only apply to a property not yet in
// service; action names the step for the error ("converted", "bought").
async function getPreRentalProperty(propertyId, action) {
  const property = await findProperty(propertyId);
  if (!property) {
    throw new NotFoundError(`Property ${propertyId} not found`);
  }
  if (property.status !== "pre_rental") {
    throw new ConflictError(`${property.name} isn't a pre-rental property, so it can't be ${action}`);
  }
  return property;
}

// { [accountNumber]: accountId } for the given account numbers.
async function accountIdsByNumber(accountNumbers) {
  const accounts = await Promise.all(accountNumbers.map((number) => findAccountByNumber(number)));
  return Object.fromEntries(accounts.map((account) => [account.account_number, account.account_id]));
}

// Lines in the API's shape; a zero amount gives no line.
const debitLine = (accountId, cents) => cents > 0 && { account_id: accountId, debit_cents: cents, credit_cents: 0 };
const creditLine = (accountId, cents) => cents > 0 && { account_id: accountId, debit_cents: 0, credit_cents: cents };

// The posting service's shape, with every line tagged to the property
// except the ones in untaggedAccountIds (cash isn't a property's).
function toPostingLines(lines, propertyId, untaggedAccountIds = []) {
  return lines.map((line) => ({
    accountId: line.account_id,
    propertyId: untaggedAccountIds.includes(line.account_id) ? null : propertyId,
    debitCents: line.debit_cents,
    creditCents: line.credit_cents,
  }));
}

// The basis split the IRS uses: land is never depreciated, so it's kept
// apart from the building. landPercent is the land's share, e.g. 20.
function splitBasis(basisCents, landPercent) {
  const landCents = Math.round((basisCents * landPercent) / 100);
  const buildingCents = basisCents - landCents;
  if (buildingCents <= 0) {
    throw new ValidationError("The building's share must be more than zero");
  }
  return { landCents, buildingCents };
}

// After a conversion or an acquisition posts: the property becomes an
// active rental with land and building assets, so depreciation starts in
// the in-service month.
async function placeInService({ propertyId, inServiceDate, landCents, buildingCents }, trx) {
  await updateProperty(
    propertyId,
    {
      status: "active",
      placed_in_service_date: inServiceDate,
      land_basis_cents: landCents,
      building_basis_cents: buildingCents,
    },
    trx,
  );
  const asset = (name, assetClass, costCents) => ({
    property_id: propertyId,
    name,
    asset_class: assetClass,
    cost_cents: costCents,
    in_service_date: inServiceDate,
  });
  if (landCents > 0) {
    await insertFixedAsset(asset("Land", "land", landCents), trx);
  }
  await insertFixedAsset(asset("Building", "building", buildingCents), trx);
}

export {
  getPreRentalProperty,
  accountIdsByNumber,
  debitLine,
  creditLine,
  toPostingLines,
  splitBasis,
  placeInService,
};
