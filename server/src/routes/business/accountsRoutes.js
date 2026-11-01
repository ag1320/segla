import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import { findAccounts } from "../../controllers/business/accountsController.js";
import {
  createAccount,
  editAccount,
} from "../../services/business/accountsService.js";
import { ID_PARAMS, atLeastOneField } from "./schemaFields.js";

const ACCOUNT_TYPES = [
  "asset",
  "contra_asset",
  "liability",
  "equity",
  "income",
  "expense",
];

const ACCOUNT_NAME = z.string().trim().min(1).max(255);
const SCHEDULE_E_LINE = z.number().int().min(3).max(19).nullable();

const NEW_ACCOUNT = z.strictObject({
  accountNumber: z.number().int().min(1000).max(9999),
  name: ACCOUNT_NAME,
  accountType: z.enum(ACCOUNT_TYPES),
  scheduleELine: SCHEDULE_E_LINE.optional(),
});

const ACCOUNT_CHANGES = atLeastOneField(
  z.strictObject({
    name: ACCOUNT_NAME.optional(),
    scheduleELine: SCHEDULE_E_LINE.optional(),
    isActive: z.boolean().optional(),
  }),
);

const router = Router();

router.get("/business/accounts", async (req, res) => {
  res.status(200).json(await findAccounts());
});

router.post(
  "/business/accounts",
  validate({ body: NEW_ACCOUNT }),
  async (req, res) => {
    res.status(201).json(await createAccount(req.validated.body));
  },
);

router.patch(
  "/business/accounts/:id",
  validate({ params: ID_PARAMS, body: ACCOUNT_CHANGES }),
  async (req, res) => {
    const account = await editAccount(req.validated.params.id, req.validated.body);
    res.status(200).json(account);
  },
);

export default router;
