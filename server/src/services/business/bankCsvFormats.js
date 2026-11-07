import { parseCsv } from "../../utils/parseCsv.js";
import { ValidationError } from "../../utils/errors.js";

// Each bank's download: the columns it must have, and how one row (keyed by
// column name) becomes a transaction. A row that returns null is skipped.
const BANK_CSV_FORMATS = {
  chase_checking: {
    label: "Chase checking",
    columns: ["Details", "Posting Date", "Description", "Amount", "Type", "Balance", "Check or Slip #"],
    toTransaction: (row) => ({
      transactionDate: usDateToIsoDate(row["Posting Date"]),
      description: cleanDescription(row["Description"]),
      amountCents: dollarsToCents(row["Amount"]),
    }),
  },
  wells_fargo_card: {
    label: "Wells Fargo credit card",
    columns: ["DATE", "DESCRIPTION", "AMOUNT", "CHECK #", "STATUS"],
    // Pending charges can still change or drop off, so they wait until a
    // later download shows them posted.
    toTransaction: (row) =>
      row["STATUS"] !== "Posted"
        ? null
        : {
            transactionDate: usDateToIsoDate(row["DATE"]),
            description: cleanDescription(row["DESCRIPTION"]),
            amountCents: dollarsToCents(row["AMOUNT"]),
          },
  },
};

const BYTE_ORDER_MARK = "﻿";

// Returns [{ transactionDate, description, amountCents, csvRow }] in file
// order. Throws a ValidationError naming the line of anything unreadable.
function parseBankCsv(importFormat, csvText) {
  const format = BANK_CSV_FORMATS[importFormat];
  const [header = [], ...rows] = parseCsv(csvText.replace(BYTE_ORDER_MARK, ""));
  const columns = header.map((column) => column.trim());

  if (columns.join(",") !== format.columns.join(",")) {
    throw new ValidationError(
      `This doesn't look like a ${format.label} download. Expected the columns: ${format.columns.join(", ")}`,
    );
  }

  const transactions = [];
  rows.forEach((fields, index) => {
    const lineNumber = index + 2;
    if (fields.length !== columns.length) {
      throw new ValidationError(
        `Line ${lineNumber} has ${fields.length} columns instead of ${columns.length}`,
      );
    }
    const csvRow = Object.fromEntries(columns.map((column, i) => [column, fields[i]]));
    const transaction = format.toTransaction(csvRow);
    if (transaction === null) return;

    if (transaction.transactionDate === null) {
      throw new ValidationError(`Line ${lineNumber} has a date that can't be read`);
    }
    if (transaction.amountCents === null) {
      throw new ValidationError(`Line ${lineNumber} has an amount that can't be read`);
    }
    // A zero-dollar row (a card verification, say) has nothing to book.
    if (transaction.amountCents === 0) return;

    transactions.push({ ...transaction, csvRow });
  });
  return transactions;
}

// "10/26/2026" → "2026-10-26", or null if it isn't a real date.
function usDateToIsoDate(text) {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text.trim());
  if (!match) return null;

  const [, month, day, year] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date.toISOString().slice(0, 10);
}

// "-22.26" → -2226 and "5200" → 520000, or null if it isn't an amount.
// Read as text so no floating-point rounding touches the money.
function dollarsToCents(text) {
  const match = /^(-?)(\d+)(?:\.(\d{1,2}))?$/.exec(text.trim());
  if (!match) return null;

  const [, sign, dollars, cents = ""] = match;
  const amount = Number(dollars) * 100 + Number(cents.padEnd(2, "0"));
  return sign === "-" ? -amount : amount;
}

// Chase pads descriptions with runs of spaces.
function cleanDescription(text) {
  return text.replace(/\s+/g, " ").trim();
}

export { parseBankCsv };
