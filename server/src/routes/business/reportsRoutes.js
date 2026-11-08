import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import {
  getTrialBalance,
  getGeneralLedger,
  getAccountBalances,
} from "../../services/business/reportsService.js";
import { ID, ISO_DATE } from "./schemaFields.js";

const TRIAL_BALANCE_QUERY = z.strictObject({
  entityId: ID,
  asOfDate: ISO_DATE,
});

const GENERAL_LEDGER_QUERY = z.strictObject({
  entityId: ID,
  from: ISO_DATE,
  to: ISO_DATE,
});

const ACCOUNT_BALANCES_QUERY = z.strictObject({
  entityId: ID,
  from: ISO_DATE.optional(),
  to: ISO_DATE.optional(),
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
  validate({ query: GENERAL_LEDGER_QUERY }),
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

export default router;
