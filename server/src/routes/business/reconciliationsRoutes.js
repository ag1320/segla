import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import { findReconciliations } from "../../controllers/business/reconciliationsController.js";
import {
  getReconciliationWorksheet,
  reconcile,
  undoReconciliation,
} from "../../services/business/reconciliationsService.js";
import { ID, ID_PARAMS, ISO_DATE } from "./schemaFields.js";

const RECONCILIATION_FILTERS = z.strictObject({
  bankAccountId: ID.optional(),
});

const WORKSHEET_QUERY = z.strictObject({
  statementDate: ISO_DATE,
});

// statementBalanceCents is signed: a card statement showing a credit
// balance (the bank owes you) is negative.
const NEW_RECONCILIATION = z.strictObject({
  bankAccountId: ID,
  statementDate: ISO_DATE,
  statementBalanceCents: z.number().int(),
  clearedLineIds: z.array(ID),
});

const router = Router();

router.get(
  "/business/reconciliations",
  validate({ query: RECONCILIATION_FILTERS }),
  async (req, res) => {
    res.status(200).json(await findReconciliations(req.validated.query.bankAccountId));
  },
);

router.get(
  "/business/bank-accounts/:id/reconciliation-worksheet",
  validate({ params: ID_PARAMS, query: WORKSHEET_QUERY }),
  async (req, res) => {
    const worksheet = await getReconciliationWorksheet(
      req.validated.params.id,
      req.validated.query.statementDate,
    );
    res.status(200).json(worksheet);
  },
);

router.post(
  "/business/reconciliations",
  validate({ body: NEW_RECONCILIATION }),
  async (req, res) => {
    res.status(201).json(await reconcile(req.validated.body));
  },
);

router.delete(
  "/business/reconciliations/:id",
  validate({ params: ID_PARAMS }),
  async (req, res) => {
    await undoReconciliation(req.validated.params.id);
    res.status(204).end();
  },
);

export default router;
