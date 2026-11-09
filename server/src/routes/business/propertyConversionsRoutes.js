import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import { previewConversion, convertProperty } from "../../services/business/conversionService.js";
import { ID_PARAMS, ISO_DATE, CENTS } from "./schemaFields.js";

const CONVERSION = z.strictObject({
  placedInServiceDate: ISO_DATE,
  adjustedBasisCents: z.number().int().positive(),
  fairMarketValueCents: z.number().int().positive(),
  // The land's share of the value, e.g. 22.5 for 22.5%.
  landPercent: z.number().min(0).max(100).multipleOf(0.01),
  mortgageBalanceCents: CENTS,
  // Negative for an escrow deficit.
  escrowBalanceCents: z.number().int(),
});

const router = Router();

// Shows the entry a conversion would post, without posting it.
router.post(
  "/business/properties/:id/conversion-preview",
  validate({ params: ID_PARAMS, body: CONVERSION }),
  async (req, res) => {
    res.status(200).json(await previewConversion(req.validated.params.id, req.validated.body));
  },
);

router.post(
  "/business/properties/:id/conversion",
  validate({ params: ID_PARAMS, body: CONVERSION }),
  async (req, res) => {
    res.status(201).json(await convertProperty(req.validated.params.id, req.validated.body));
  },
);

export default router;
