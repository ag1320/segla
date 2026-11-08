import { findEntity } from "../../controllers/business/entitiesController.js";
import { findAccounts } from "../../controllers/business/accountsController.js";
import {
  findAccountTotals,
  findCashMovementsByAccount,
} from "../../controllers/business/reportsController.js";
import { NotFoundError, ValidationError } from "../../utils/errors.js";
import { dayBefore } from "../../utils/isoDates.js";

// Cash is the bank accounts numbered 1000–1099 (checking and the security
// deposit account). Escrow (1100) is held by the loan servicer, so money
// sent there counts as spent.
const FIRST_CASH_NUMBER = 1000;
const LAST_CASH_NUMBER = 1099;

const SECTIONS = ["operating", "investing", "financing"];

// Where each kind of account's cash belongs on the statement:
// operating: running the rental (rent, expenses, card payments, deposits)
// investing: buying or improving the property
// financing: the mortgage, loan costs, and money in from or out to the owner
function sectionFor(account) {
  const number = account.account_number;
  if (account.account_type === "income" || account.account_type === "expense") return "operating";
  if (number >= 1500 && number <= 1599) return "investing";
  if (number >= 1700 && number <= 1799) return "financing";
  if (number >= 2200 && number <= 2999) return "financing";
  if (account.account_type === "equity") return "financing";
  return "operating";
}

// Where cash came from and went for a period, grouped into operating,
// investing and financing, by the account on the other side of each entry.
// Cash at the start plus the net change equals cash at the end, which is
// the cash on the balance sheet that day.
async function getCashFlow({ entityId, from, to }) {
  if (!(await findEntity(entityId))) {
    throw new NotFoundError(`Entity ${entityId} not found`);
  }
  if (from > to) {
    throw new ValidationError("The start date must be on or before the end date");
  }

  const accounts = await findAccounts();
  const cashAccountIds = accounts
    .filter((account) => account.account_number >= FIRST_CASH_NUMBER && account.account_number <= LAST_CASH_NUMBER)
    .map((account) => account.account_id);
  const [movements, openingTotals, closingTotals] = await Promise.all([
    findCashMovementsByAccount({ entityId, from, to, cashAccountIds }),
    findAccountTotals({ entityId, to: dayBefore(from) }),
    findAccountTotals({ entityId, to }),
  ]);

  const sections = Object.fromEntries(SECTIONS.map((name) => [name, { rows: [], total_cents: 0 }]));
  for (const account of accounts) {
    const movement = movements.find((row) => row.account_id === account.account_id);
    if (!movement || movement.cash_cents === 0) continue;
    const section = sections[sectionFor(account)];
    section.rows.push({
      account_id: account.account_id,
      account_number: account.account_number,
      name: account.name,
      amount_cents: movement.cash_cents,
      compare_amount_cents: null,
    });
    section.total_cents += movement.cash_cents;
  }
  for (const section of Object.values(sections)) section.compare_total_cents = null;

  return {
    entity_id: entityId,
    from,
    to,
    ...sections,
    net_change_cents: SECTIONS.reduce((total, name) => total + sections[name].total_cents, 0),
    opening_cash_cents: cashBalance(openingTotals, cashAccountIds),
    closing_cash_cents: cashBalance(closingTotals, cashAccountIds),
  };
}

function cashBalance(totals, cashAccountIds) {
  return totals
    .filter((row) => cashAccountIds.includes(row.account_id))
    .reduce((total, row) => total + row.debit_cents - row.credit_cents, 0);
}

export { getCashFlow };
