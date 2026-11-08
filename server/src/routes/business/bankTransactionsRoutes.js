import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import { findBankTransactions } from "../../controllers/business/bankTransactionsController.js";
import {
  postBankTransaction,
  changeBankTransactionStatus,
} from "../../services/business/bankTransactionsService.js";
import { ID, ID_PARAMS } from "./schemaFields.js";

const STATUSES = ["new", "posted", "excluded"];

const BANK_TRANSACTION_FILTERS = z.strictObject({
  status: z.enum(STATUSES).optional(),
  bankAccountId: ID.optional(),
});

// Only new ⇄ excluded. Posting has its own route.
const STATUS_CHANGE = z.strictObject({
  status: z.enum(["new", "excluded"]),
});

const SPLIT = z.strictObject({
  accountId: ID,
  propertyId: ID.nullable().optional(),
  amountCents: z.number().int().positive(),
  needsCpaReview: z.boolean().optional(),
});

const POSTING = z.strictObject({
  memo: z.string().trim().max(1000).nullable().optional(),
  splits: z.array(SPLIT).min(1),
});

const router = Router();

router.get(
  "/business/bank-transactions",
  validate({ query: BANK_TRANSACTION_FILTERS }),
  async (req, res) => {
    res.status(200).json(await findBankTransactions(req.validated.query));
  },
);

router.patch(
  "/business/bank-transactions/:id",
  validate({ params: ID_PARAMS, body: STATUS_CHANGE }),
  async (req, res) => {
    const transaction = await changeBankTransactionStatus(
      req.validated.params.id,
      req.validated.body.status,
    );
    res.status(200).json(transaction);
  },
);

router.post(
  "/business/bank-transactions/:id/journal-entry",
  validate({ params: ID_PARAMS, body: POSTING }),
  async (req, res) => {
    const entry = await postBankTransaction(req.validated.params.id, req.validated.body);
    res.status(201).json(entry);
  },
);

export default router;
