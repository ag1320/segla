import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import { previewAcquisition, acquireProperty } from "../../services/business/acquisitionService.js";
import { ID, ID_PARAMS, ISO_DATE, CENTS } from "./schemaFields.js";

// Every amount is from the closing statement; leave out what isn't on it.
const ACQUISITION = z.strictObject({
  closingDate: ISO_DATE,
  inServiceDate: ISO_DATE,
  purchasePriceCents: z.number().int().positive(),
  landPercent: z.number().min(0).max(100).multipleOf(0.01),
  capitalizedCostsCents: CENTS.default(0),
  sellerCreditsCents: CENTS.default(0),
  loanCostsCents: CENTS.default(0),
  prepaidInterestCents: CENTS.default(0),
  propertyTaxCents: CENTS.default(0),
  insuranceCents: CENTS.default(0),
  escrowDepositCents: CENTS.default(0),
  loanAmountCents: CENTS.default(0),
  // The imported wire or check, when it's in the Inbox; otherwise bankCents
  // comes out of business checking.
  bankTransactionId: ID.nullable().default(null),
  bankCents: CENTS.default(0),
  personalFundsCents: CENTS.default(0),
});

const router = Router();

// Shows the entry a purchase would post, and how far off the two sides
// are, without posting it.
router.post(
  "/business/properties/:id/acquisition-preview",
  validate({ params: ID_PARAMS, body: ACQUISITION }),
  async (req, res) => {
    res.status(200).json(await previewAcquisition(req.validated.params.id, req.validated.body));
  },
);

router.post(
  "/business/properties/:id/acquisition",
  validate({ params: ID_PARAMS, body: ACQUISITION }),
  async (req, res) => {
    res.status(201).json(await acquireProperty(req.validated.params.id, req.validated.body));
  },
);

export default router;
