import knex from "../../controllers/dbConnection.js";
import { findAccountsByIds } from "../../controllers/business/accountsController.js";
import { findPropertiesByIds } from "../../controllers/business/propertiesController.js";
import { findVendorsByIds } from "../../controllers/business/vendorsController.js";
import {
  findRule,
  findRuleByPattern,
  insertRule,
  updateRule,
  deleteRule,
} from "../../controllers/business/rulesController.js";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from "../../utils/errors.js";

// A rule suggests a category for any imported transaction whose
// description contains descriptionPattern, ignoring case. Pass trx to save
// it inside a caller's transaction (saving a rule while posting).
async function createRule(
  { descriptionPattern, accountId, propertyId, vendorId },
  trx = knex,
) {
  await assertPatternFree(descriptionPattern, trx);
  await assertChoicesExist({ accountId, propertyId, vendorId }, trx);

  return insertRule(
    {
      description_pattern: descriptionPattern,
      account_id: accountId,
      property_id: propertyId ?? null,
      vendor_id: vendorId ?? null,
    },
    trx,
  );
}

async function editRule(ruleId, changes) {
  const rule = await findRule(ruleId);
  if (!rule) {
    throw new NotFoundError(`Rule ${ruleId} not found`);
  }
  const isNewPattern =
    changes.descriptionPattern !== undefined &&
    changes.descriptionPattern.toLowerCase() !== rule.description_pattern.toLowerCase();
  if (isNewPattern) {
    await assertPatternFree(changes.descriptionPattern);
  }
  await assertChoicesExist(changes);

  return updateRule(ruleId, {
    description_pattern: changes.descriptionPattern,
    account_id: changes.accountId,
    property_id: changes.propertyId,
    vendor_id: changes.vendorId,
  });
}

// Rules only suggest categories, so removing one changes no posted entry.
async function removeRule(ruleId) {
  const deletedCount = await deleteRule(ruleId);
  if (deletedCount === 0) {
    throw new NotFoundError(`Rule ${ruleId} not found`);
  }
}

// The longest matching pattern wins, so "HOME DEPOT" beats "DEPOT".
function findMatchingRule(rules, description) {
  const lowerDescription = description.toLowerCase();
  const matches = rules.filter((rule) =>
    lowerDescription.includes(rule.description_pattern.toLowerCase()),
  );
  matches.sort((a, b) => b.description_pattern.length - a.description_pattern.length);
  return matches[0] ?? null;
}

async function assertPatternFree(descriptionPattern, trx = knex) {
  const existing = await findRuleByPattern(descriptionPattern, trx);
  if (existing) {
    throw new ConflictError(`A rule for "${existing.description_pattern}" already exists`);
  }
}

// Each id is optional; only the ones sent are checked.
async function assertChoicesExist({ accountId, propertyId, vendorId }, trx = knex) {
  if (accountId !== undefined) {
    const [account] = await findAccountsByIds([accountId], trx);
    if (!account) {
      throw new ValidationError(`Account ${accountId} doesn't exist`);
    }
    if (!account.is_active) {
      throw new ValidationError(`Account ${account.account_number} ${account.name} is inactive`);
    }
  }
  if (propertyId != null) {
    const [property] = await findPropertiesByIds([propertyId], trx);
    if (!property) {
      throw new ValidationError(`Property ${propertyId} doesn't exist`);
    }
  }
  if (vendorId != null) {
    const [vendor] = await findVendorsByIds([vendorId], trx);
    if (!vendor) {
      throw new ValidationError(`Vendor ${vendorId} doesn't exist`);
    }
  }
}

export { createRule, editRule, removeRule, findMatchingRule };
