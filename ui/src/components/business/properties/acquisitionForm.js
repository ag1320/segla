import { centsOrZero } from "../businessFormat";

// The purchase wizard's form: text fields while typing, cents for the API.

export const DOLLAR_FIELDS = [
  "purchasePrice",
  "capitalizedCosts",
  "sellerCredits",
  "loanCosts",
  "prepaidInterest",
  "propertyTax",
  "insurance",
  "escrowDeposit",
  "loanAmount",
  "personalFunds",
  "bank",
];

const OWN_ACCOUNT_COSTS = ["loanCosts", "prepaidInterest", "propertyTax", "insurance", "escrowDeposit"];

export const emptyAcquisitionForm = () => ({
  closingDate: "",
  inServiceDate: "",
  landPercent: "",
  bankTransactionId: "",
  ...Object.fromEntries(DOLLAR_FIELDS.map((field) => [field, ""])),
});

// wire: the picked Inbox transaction, or undefined. Its amount replaces
// the typed bank amount.
export const acquisitionTotals = (form, wire) => {
  const cents = (field) => centsOrZero(form[field]);
  const costsCents =
    cents("purchasePrice") +
    cents("capitalizedCosts") -
    cents("sellerCredits") +
    OWN_ACCOUNT_COSTS.reduce((total, field) => total + cents(field), 0);
  const paidCents = cents("loanAmount") + cents("personalFunds") + (wire ? -wire.amountCents : cents("bank"));
  return { costsCents, paidCents, offCents: costsCents - paidCents };
};

export const toAcquisition = (form, wire) => {
  const cents = (field) => centsOrZero(form[field]);
  return {
    closingDate: form.closingDate,
    inServiceDate: form.inServiceDate,
    landPercent: Number(form.landPercent),
    purchasePriceCents: cents("purchasePrice"),
    capitalizedCostsCents: cents("capitalizedCosts"),
    sellerCreditsCents: cents("sellerCredits"),
    loanCostsCents: cents("loanCosts"),
    prepaidInterestCents: cents("prepaidInterest"),
    propertyTaxCents: cents("propertyTax"),
    insuranceCents: cents("insurance"),
    escrowDepositCents: cents("escrowDeposit"),
    loanAmountCents: cents("loanAmount"),
    personalFundsCents: cents("personalFunds"),
    bankTransactionId: wire ? wire.id : null,
    bankCents: wire ? 0 : cents("bank"),
  };
};
