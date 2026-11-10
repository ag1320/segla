import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import {
  getTrialBalance,
  getGeneralLedger,
  getAccountBalances,
} from "../../services/business/reportsService.js";
import {
  getProfitAndLoss,
  getBalanceSheet,
  getOwnersEquity,
} from "../../services/business/financialStatementsService.js";
import { getCashFlow } from "../../services/business/cashFlowService.js";
import { getOperatingStatement } from "../../services/business/operatingStatementService.js";
import { getScheduleE, ALLOCATION_METHODS } from "../../services/business/scheduleEService.js";
import { get1099Candidates, getStartupCosts } from "../../services/business/yearEndService.js";
import { ID, ISO_DATE } from "./schemaFields.js";

const TRIAL_BALANCE_QUERY = z.strictObject({
  entityId: ID,
  asOfDate: ISO_DATE,
});

// The general ledger, cash flow and owner's equity statements all cover
// one period.
const PERIOD_QUERY = z.strictObject({
  entityId: ID,
  from: ISO_DATE,
  to: ISO_DATE,
});

const OPERATING_STATEMENT_QUERY = z.strictObject({
  propertyId: ID,
  from: ISO_DATE,
  to: ISO_DATE,
});

const AS_OF_QUERY = z.strictObject({ entityId: ID, asOfDate: ISO_DATE });

const TAX_YEAR_QUERY = z.strictObject({
  entityId: ID,
  taxYear: z.coerce.number().int().min(2000).max(2100),
});

const SCHEDULE_E_QUERY = z.strictObject({
  entityId: ID,
  taxYear: z.coerce.number().int().min(2000).max(2100),
  allocation: z.enum(ALLOCATION_METHODS).default("equal"),
});

const ACCOUNT_BALANCES_QUERY = z.strictObject({
  entityId: ID,
  from: ISO_DATE.optional(),
  to: ISO_DATE.optional(),
});

// compareFrom and compareTo come together, for a second column.
const PROFIT_AND_LOSS_QUERY = z.strictObject({
  entityId: ID,
  from: ISO_DATE,
  to: ISO_DATE,
  compareFrom: ISO_DATE.optional(),
  compareTo: ISO_DATE.optional(),
  propertyId: ID.optional(),
});

const BALANCE_SHEET_QUERY = z.strictObject({
  entityId: ID,
  asOfDate: ISO_DATE,
  compareAsOfDate: ISO_DATE.optional(),
});

const router = Router();

router.get(
  "/business/reports/trial-balance",
  validate({ query: TRIAL_BALANCE_QUERY }),
  async (req, res) => {
    res.status(200).json(await getTrialBalance(req.validated.query));
  },
);

router.get(
  "/business/reports/general-ledger",
  validate({ query: PERIOD_QUERY }),
  async (req, res) => {
    res.status(200).json(await getGeneralLedger(req.validated.query));
  },
);

router.get(
  "/business/reports/account-balances",
  validate({ query: ACCOUNT_BALANCES_QUERY }),
  async (req, res) => {
    res.status(200).json(await getAccountBalances(req.validated.query));
  },
);

router.get(
  "/business/reports/profit-and-loss",
  validate({ query: PROFIT_AND_LOSS_QUERY }),
  async (req, res) => {
    res.status(200).json(await getProfitAndLoss(req.validated.query));
  },
);

router.get(
  "/business/reports/balance-sheet",
  validate({ query: BALANCE_SHEET_QUERY }),
  async (req, res) => {
    res.status(200).json(await getBalanceSheet(req.validated.query));
  },
);

router.get(
  "/business/reports/cash-flow",
  validate({ query: PERIOD_QUERY }),
  async (req, res) => {
    res.status(200).json(await getCashFlow(req.validated.query));
  },
);

router.get(
  "/business/reports/owners-equity",
  validate({ query: PERIOD_QUERY }),
  async (req, res) => {
    res.status(200).json(await getOwnersEquity(req.validated.query));
  },
);

router.get(
  "/business/reports/1099-candidates",
  validate({ query: TAX_YEAR_QUERY }),
  async (req, res) => {
    res.status(200).json(await get1099Candidates(req.validated.query));
  },
);

router.get(
  "/business/reports/startup-costs",
  validate({ query: AS_OF_QUERY }),
  async (req, res) => {
    res.status(200).json(await getStartupCosts(req.validated.query));
  },
);

router.get(
  "/business/reports/schedule-e",
  validate({ query: SCHEDULE_E_QUERY }),
  async (req, res) => {
    res.status(200).json(await getScheduleE(req.validated.query));
  },
);

router.get(
  "/business/reports/operating-statement",
  validate({ query: OPERATING_STATEMENT_QUERY }),
  async (req, res) => {
    res.status(200).json(await getOperatingStatement(req.validated.query));
  },
);

export default router;
