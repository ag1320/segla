import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import knex from "../../src/controllers/dbConnection.js";
import { importBankCsv } from "../../src/services/business/bankImportService.js";
import { ValidationError } from "../../src/utils/errors.js";

// The fixtures copy the layout of real Chase and Wells Fargo downloads,
// with made-up transactions. The Chase one has Windows line endings, as
// Chase's downloads do.
const CHASE_CSV = await readFile(new URL("./fixtures/chase_checking.csv", import.meta.url), "utf8");
const WELLS_FARGO_CSV = await readFile(new URL("./fixtures/wells_fargo_card.csv", import.meta.url), "utf8");

let chaseId;
let wellsFargoId;

before(async () => {
  const bankAccounts = await knex("bank_accounts");
  chaseId = bankAccounts.find((bankAccount) => bankAccount.import_format === "chase_checking").bank_account_id;
  wellsFargoId = bankAccounts.find((bankAccount) => bankAccount.import_format === "wells_fargo_card").bank_account_id;
});

beforeEach(() => knex.raw("truncate bank_transactions restart identity"));

after(() => knex.destroy());

function findImported(bankAccountId) {
  return knex("bank_transactions")
    .where({ bank_account_id: bankAccountId })
    .select(
      knex.raw("to_char(transaction_date, 'YYYY-MM-DD') as transaction_date"),
      "description",
      "amount_cents",
      "status",
    )
    .orderBy("bank_transaction_id");
}

test("a Chase download imports every row with its date and signed amount", async () => {
  const result = await importBankCsv(chaseId, CHASE_CSV);

  assert.deepEqual(result, { imported_count: 5, already_imported_count: 0 });
  const imported = await findImported(chaseId);
  assert.deepEqual(imported[0], {
    transaction_date: "2026-10-28",
    description: "HARDWARE STORE #100 ANYTOWN NM 10/27",
    amount_cents: -4500,
    status: "new",
  });
  assert.equal(imported[3].description, "PAINT SUPPLY, INC ANYTOWN NM");
  assert.equal(imported[4].amount_cents, 500000);
});

test("re-importing the same file adds nothing", async () => {
  await importBankCsv(chaseId, CHASE_CSV);
  const result = await importBankCsv(chaseId, CHASE_CSV);

  assert.deepEqual(result, { imported_count: 0, already_imported_count: 5 });
  assert.equal((await findImported(chaseId)).length, 5);
});

test("an overlapping download adds only the rows not imported yet", async () => {
  await importBankCsv(chaseId, CHASE_CSV);
  const [header, ...rows] = CHASE_CSV.trim().split("\r\n");
  const laterDownload = [
    header,
    "DEBIT,10/30/2026,COFFEE SHOP ANYTOWN NM 10/29,-5.00,DEBIT_CARD,4885.00,",
    ...rows,
  ].join("\r\n");

  const result = await importBankCsv(chaseId, laterDownload);

  assert.deepEqual(result, { imported_count: 1, already_imported_count: 5 });
});

test("a Wells Fargo download skips pending charges and reads quoted text", async () => {
  const result = await importBankCsv(wellsFargoId, WELLS_FARGO_CSV);

  assert.deepEqual(result, { imported_count: 3, already_imported_count: 0 });
  const imported = await findImported(wellsFargoId);
  assert.deepEqual(
    imported.map((transaction) => [transaction.description, transaction.amount_cents]),
    [
      ["AUTOMATIC PAYMENT - THANK YOU", 20000],
      ['LUMBER YARD "NORTH" ANYTOWN NM', -8025],
      ["HARDWARE STORE #100 ANYTOWN NM", -12050],
    ],
  );
});

test("a file from the wrong bank is rejected and nothing is imported", async () => {
  await assert.rejects(() => importBankCsv(wellsFargoId, CHASE_CSV), ValidationError);
  assert.equal((await findImported(wellsFargoId)).length, 0);
});
