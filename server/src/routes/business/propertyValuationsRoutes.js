import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import {
  listValuations,
  createValuation,
  editValuation,
  removeValuation,
} from "../../services/business/propertyValuationsService.js";
import { ID_PARAMS, ISO_DATE, atLeastOneField } from "./schemaFields.js";

const VALUATION_SOURCES = ["appraisal", "broker", "online_estimate"];

const VALUATION_DETAILS = {
  valuationDate: ISO_DATE,
  valueCents: z.number().int().positive(),
  source: z.enum(VALUATION_SOURCES),
  note: z.string().trim().max(255).nullable().optional(),
};

const NEW_VALUATION = z.strictObject(VALUATION_DETAILS);

const VALUATION_CHANGES = atLeastOneField(z.strictObject(VALUATION_DETAILS).partial());

const router = Router();

router.get(
  "/business/properties/:id/valuations",
  validate({ params: ID_PARAMS }),
  async (req, res) => {
    res.status(200).json(await listValuations(req.validated.params.id));
  },
);

router.post(
  "/business/properties/:id/valuations",
  validate({ params: ID_PARAMS, body: NEW_VALUATION }),
  async (req, res) => {
    const valuation = await createValuation({
      propertyId: req.validated.params.id,
      ...req.validated.body,
    });
    res.status(201).json(valuation);
  },
);

router.patch(
  "/business/property-valuations/:id",
  validate({ params: ID_PARAMS, body: VALUATION_CHANGES }),
  async (req, res) => {
    res.status(200).json(await editValuation(req.validated.params.id, req.validated.body));
  },
);

router.delete(
  "/business/property-valuations/:id",
  validate({ params: ID_PARAMS }),
  async (req, res) => {
    await removeValuation(req.validated.params.id);
    res.status(204).end();
  },
);

export default router;
