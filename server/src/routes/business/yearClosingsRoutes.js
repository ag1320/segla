import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import { closeYear, listYearClosings } from "../../services/business/yearCloseService.js";
import { ID } from "./schemaFields.js";

const LIST_QUERY = z.strictObject({ entityId: ID });

const NEW_CLOSING = z.strictObject({ entityId: ID, year: z.number().int().min(2000).max(2100) });

const router = Router();

router.get(
  "/business/year-closings",
  validate({ query: LIST_QUERY }),
  async (req, res) => {
    res.status(200).json(await listYearClosings(req.validated.query.entityId));
  },
);

// Undo a close by reversing its entry in the Ledger, on the same date.
router.post(
  "/business/year-closings",
  validate({ body: NEW_CLOSING }),
  async (req, res) => {
    res.status(201).json(await closeYear(req.validated.body));
  },
);

export default router;
