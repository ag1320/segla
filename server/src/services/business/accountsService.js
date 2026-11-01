import {
  findAccount,
  findAccountByNumber,
  insertAccount,
  updateAccount,
} from "../../controllers/business/accountsController.js";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from "../../utils/errors.js";

// Schedule E lines 3-4 are income (rents, royalties); 5-19 are expenses.
const SCHEDULE_E_LINES_BY_TYPE = {
  income: { first: 3, last: 4 },
  expense: { first: 5, last: 19 },
};

async function createAccount({ accountNumber, name, accountType, scheduleELine }) {
  if (await findAccountByNumber(accountNumber)) {
    throw new ConflictError(`Account number ${accountNumber} is already taken`);
  }
  assertScheduleELineFits(accountType, scheduleELine);

  return insertAccount({
    account_number: accountNumber,
    name,
    account_type: accountType,
    schedule_e_line: scheduleELine ?? null,
  });
}

// The number and type can't change: past entries were posted against them.
// To restructure, add a new account and retire the old one.
async function editAccount(accountId, { name, scheduleELine, isActive }) {
  const account = await findAccount(accountId);
  if (!account) {
    throw new NotFoundError(`Account ${accountId} not found`);
  }
  assertScheduleELineFits(account.account_type, scheduleELine);

  return updateAccount(accountId, {
    name,
    schedule_e_line: scheduleELine,
    is_active: isActive,
  });
}

function assertScheduleELineFits(accountType, scheduleELine) {
  if (scheduleELine == null) return;

  const lines = SCHEDULE_E_LINES_BY_TYPE[accountType];
  if (!lines || scheduleELine < lines.first || scheduleELine > lines.last) {
    throw new ValidationError(
      "Schedule E lines 3-4 are for income accounts and lines 5-19 for expense accounts",
    );
  }
}

export { createAccount, editAccount };
