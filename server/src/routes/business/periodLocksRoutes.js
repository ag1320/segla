import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import { getPeriodLock, setPeriodLock } from "../../services/business/periodLocksService.js";
import { ID_PARAMS, ISO_DATE } from "./schemaFields.js";

// null reopens every month.
const PERIOD_LOCK = z.strictObject({
  lockedThroughDate: ISO_DATE.nullable(),
});

const router = Router();

router.get(
  "/business/entities/:id/period-lock",
  validate({ params: ID_PARAMS }),
  async (req, res) => {
    res.status(200).json(await getPeriodLock(req.validated.params.id));
  },
);

router.put(
  "/business/entities/:id/period-lock",
  validate({ params: ID_PARAMS, body: PERIOD_LOCK }),
  async (req, res) => {
    const lock = await setPeriodLock(req.validated.params.id, req.validated.body.lockedThroughDate);
    res.status(200).json(lock);
  },
);

export default router;
