import knex from "../../controllers/dbConnection.js";
import { findBankAccount } from "../../controllers/business/bankAccountsController.js";
import { updateBankTransaction } from "../../controllers/business/bankTransactionsController.js";
import { postJournalEntry } from "./postingService.js";
import { findOpenTransaction } from "./bankTransactionsService.js";
import {
  getPreRentalProperty,
  accountIdsByNumber,
  debitLine,
  creditLine,
  toPostingLines,
  splitBasis,
  placeInService,
} from "./placeInService.js";
import { ValidationError } from "../../utils/errors.js";

const ESCROW = 1100;
const LAND = 1500;
const BUILDING = 1510;
const LOAN_COSTS = 1700;
const MORTGAGES = 2200;
const OWNER_CONTRIBUTIONS = 3000;
const INSURANCE = 5040;
const MORTGAGE_INTEREST = 5070;
const PROPERTY_TAXES = 5110;
const BUSINESS_CHECKING = 1000;

// Buying a property, from the closing statement. What it cost: the price
// plus capitalized closing costs, less seller credits, is the basis (split
// into land and building); loan costs, prepaid interest, taxes, insurance
// and the escrow deposit each go to their own account. How it was paid:
// the loan, the bank (optionally the imported wire itself) and personal
// money. The two sides must match to the cent.
// acquisition: { closingDate, inServiceDate, purchasePriceCents, landPercent,
//   capitalizedCostsCents, sellerCreditsCents, loanCostsCents, prepaidInterestCents,
//   propertyTaxCents, insuranceCents, escrowDepositCents, loanAmountCents,
//   bankTransactionId, bankCents, personalFundsCents }
async function previewAcquisition(propertyId, acquisition) {
  const property = await getPreRentalProperty(propertyId, "bought");
  return buildAcquisition(property, acquisition, knex);
}

async function acquireProperty(propertyId, acquisition) {
  const property = await getPreRentalProperty(propertyId, "bought");

  return knex.transaction(async (trx) => {
    const plan = await buildAcquisition(property, acquisition, trx);
    if (plan.difference_cents !== 0) {
      throw new ValidationError(
        `The closing statement is off by ${formatDollars(Math.abs(plan.difference_cents))}: costs ${formatDollars(plan.costs_cents)}, paid ${formatDollars(plan.paid_cents)}`,
      );
    }
    const entry = await postJournalEntry(
      {
        entityId: property.entity_id,
        entryDate: acquisition.closingDate,
        memo: `${property.name} purchased`,
        source: "system",
        lines: toPostingLines(plan.lines, propertyId, [plan.bank_account_id]),
      },
      trx,
    );
    if (acquisition.bankTransactionId) {
      await updateBankTransaction(
        acquisition.bankTransactionId,
        { status: "posted", journal_entry_id: entry.journal_entry_id },
        trx,
      );
    }
    await placeInService(
      {
        propertyId,
        inServiceDate: acquisition.inServiceDate,
        landCents: plan.land_cents,
        buildingCents: plan.building_cents,
      },
      trx,
    );
    return { ...plan, journal_entry_id: entry.journal_entry_id };
  });
}

async function buildAcquisition(property, acquisition, trx) {
  const basisCents =
    acquisition.purchasePriceCents + acquisition.capitalizedCostsCents - acquisition.sellerCreditsCents;
  if (basisCents <= 0) {
    throw new ValidationError("Seller credits can't be more than the price and closing costs");
  }
  const { landCents, buildingCents } = splitBasis(basisCents, acquisition.landPercent);
  const bank = await bankPayment(property, acquisition, trx);
  const ids = await accountIdsByNumber([
    ESCROW,
    LAND,
    BUILDING,
    LOAN_COSTS,
    MORTGAGES,
    OWNER_CONTRIBUTIONS,
    INSURANCE,
    MORTGAGE_INTEREST,
    PROPERTY_TAXES,
  ]);

  const costs = [
    debitLine(ids[LAND], landCents),
    debitLine(ids[BUILDING], buildingCents),
    debitLine(ids[LOAN_COSTS], acquisition.loanCostsCents),
    debitLine(ids[MORTGAGE_INTEREST], acquisition.prepaidInterestCents),
    debitLine(ids[PROPERTY_TAXES], acquisition.propertyTaxCents),
    debitLine(ids[INSURANCE], acquisition.insuranceCents),
    debitLine(ids[ESCROW], acquisition.escrowDepositCents),
  ].filter(Boolean);
  const payments = [
    creditLine(ids[MORTGAGES], acquisition.loanAmountCents),
    creditLine(bank.accountId, bank.cents),
    creditLine(ids[OWNER_CONTRIBUTIONS], acquisition.personalFundsCents),
  ].filter(Boolean);
  const costsCents = costs.reduce((total, line) => total + line.debit_cents, 0);
  const paidCents = payments.reduce((total, line) => total + line.credit_cents, 0);

  return {
    property_id: property.property_id,
    basis_cents: basisCents,
    land_cents: landCents,
    building_cents: buildingCents,
    costs_cents: costsCents,
    paid_cents: paidCents,
    difference_cents: costsCents - paidCents,
    bank_account_id: bank.accountId,
    lines: [...costs, ...payments],
  };
}

// The bank side: the imported wire when one is picked (its amount and
// account win, and posting marks it done), otherwise business checking.
async function bankPayment(property, acquisition, trx) {
  if (!acquisition.bankTransactionId) {
    const ids = await accountIdsByNumber([BUSINESS_CHECKING]);
    return { accountId: ids[BUSINESS_CHECKING], cents: acquisition.bankCents };
  }
  const transaction = await findOpenTransaction(acquisition.bankTransactionId, trx);
  if (transaction.amount_cents >= 0) {
    throw new ValidationError("Pick the money going out to the closing");
  }
  const bankAccount = await findBankAccount(transaction.bank_account_id, trx);
  if (bankAccount.entity_id !== property.entity_id) {
    throw new ValidationError("That bank account belongs to a different entity");
  }
  return { accountId: bankAccount.account_id, cents: -transaction.amount_cents };
}

function formatDollars(cents) {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export { previewAcquisition, acquireProperty };
