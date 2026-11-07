import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import { findBankAccounts } from "../../controllers/business/bankAccountsController.js";
import { importBankCsv } from "../../services/business/bankImportService.js";
import { ID_PARAMS } from "./schemaFields.js";

// The UI reads the downloaded file and sends its text.
const NEW_IMPORT = z.strictObject({
  csv: z.string().min(1),
});

const router = Router();

router.get("/business/bank-accounts", async (req, res) => {
  res.status(200).json(await findBankAccounts());
});

router.post(
  "/business/bank-accounts/:id/imports",
  validate({ params: ID_PARAMS, body: NEW_IMPORT }),
  async (req, res) => {
    const result = await importBankCsv(req.validated.params.id, req.validated.body.csv);
    res.status(201).json(result);
  },
);

export default router;
