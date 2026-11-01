// The business API stores money as integer cents and dates as "YYYY-MM-DD".

const DOLLAR_AMOUNT = /^\d+(\.\d{1,2})?$/;

export const formatCents = (cents) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

// For pre-filling a dollar input: 25000050 -> "250000.50", null -> "".
export const centsToDollarsText = (cents) =>
  cents === null || cents === undefined ? "" : (cents / 100).toFixed(2);

const stripFormatting = (text) => text.replace(/[$,\s]/g, "");

// Blank is allowed (it clears the value). "$250,000.50" is fine.
export const isDollarAmount = (text) =>
  text.trim() === "" || DOLLAR_AMOUNT.test(stripFormatting(text));

// Math.round, because 1.15 * 100 is 114.99999999999999 in floating point.
export const dollarsToCents = (text) =>
  text.trim() === "" ? null : Math.round(Number(stripFormatting(text)) * 100);

// new Date("2027-06-01") would be UTC midnight, the evening before in the US.
export const formatDate = (dateString) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
