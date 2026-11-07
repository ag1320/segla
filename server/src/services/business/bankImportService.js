import { createHash } from "node:crypto";
import { findBankAccount } from "../../controllers/business/bankAccountsController.js";
import { insertNewBankTransactions } from "../../controllers/business/bankTransactionsController.js";
import { parseBankCsv } from "./bankCsvFormats.js";
import { ValidationError, NotFoundError } from "../../utils/errors.js";

// Imports a bank's CSV download into bank_transactions. Rows already
// imported from an earlier file are skipped, so the same file (or an
// overlapping date range) can be imported again safely.
async function importBankCsv(bankAccountId, csvText) {
  const bankAccount = await findBankAccount(bankAccountId);
  if (!bankAccount) {
    throw new NotFoundError(`Bank account ${bankAccountId} not found`);
  }
  if (!bankAccount.import_format || !bankAccount.is_active) {
    throw new ValidationError(`${bankAccount.name} isn't imported from CSV`);
  }

  const transactions = withDedupeHashes(parseBankCsv(bankAccount.import_format, csvText));
  const inserted = await insertNewBankTransactions(
    transactions.map((transaction) => ({
      bank_account_id: bankAccountId,
      transaction_date: transaction.transactionDate,
      description: transaction.description,
      amount_cents: transaction.amountCents,
      dedupe_hash: transaction.dedupeHash,
      csv_row: transaction.csvRow,
    })),
  );

  return {
    imported_count: inserted.length,
    already_imported_count: transactions.length - inserted.length,
  };
}

// A row is identified by its date, amount and description. Two genuinely
// identical rows (two $5 coffees on one day) are told apart by counting
// how many times that row has appeared so far in the file, which gives the
// same answer every time the same day is downloaded.
function withDedupeHashes(transactions) {
  const timesSeen = new Map();
  return transactions.map((transaction) => {
    const key = [transaction.transactionDate, transaction.amountCents, transaction.description].join("|");
    const occurrence = (timesSeen.get(key) ?? 0) + 1;
    timesSeen.set(key, occurrence);
    const dedupeHash = createHash("sha256").update(`${key}|${occurrence}`).digest("hex");
    return { ...transaction, dedupeHash };
  });
}

export { importBankCsv };
