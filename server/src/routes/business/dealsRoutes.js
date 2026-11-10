import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import { listDeals, createDeal, editDeal, removeDeal } from "../../services/business/dealsService.js";
import { analyzeDeal } from "../../services/business/dealAnalysis.js";
import { ID, ID_PARAMS, CENTS, atLeastOneField } from "./schemaFields.js";

const PERCENT = z.number().min(0).max(100);

// A deal's assumptions. Amounts are cents; percents are plain numbers.
const DEAL_INPUTS = z.strictObject({
  purchasePriceCents: z.number().int().positive(),
  closingCostsCents: CENTS,
  rehabCents: CENTS,
  downPaymentPercent: PERCENT,
  interestRatePercent: z.number().min(0).max(30),
  termYears: z.number().int().positive().max(50),
  monthlyRentCents: CENTS,
  otherMonthlyIncomeCents: CENTS,
  vacancyPercent: PERCENT,
  propertyTaxCents: CENTS,
  insuranceCents: CENTS,
  repairsPercent: PERCENT,
  capexPercent: PERCENT,
  managementPercent: PERCENT,
  utilitiesMonthlyCents: CENTS,
  hoaMonthlyCents: CENTS,
  otherExpensesCents: CENTS,
});

const DEAL_NAME = z.string().trim().min(1).max(255);

const NEW_DEAL = z.strictObject({ entityId: ID, name: DEAL_NAME, inputs: DEAL_INPUTS });

const DEAL_CHANGES = atLeastOneField(z.strictObject({ name: DEAL_NAME, inputs: DEAL_INPUTS }).partial());

const LIST_QUERY = z.strictObject({ entityId: ID });

const router = Router();

router.get(
  "/business/deals",
  validate({ query: LIST_QUERY }),
  async (req, res) => {
    res.status(200).json(await listDeals(req.validated.query.entityId));
  },
);

// Works out a deal's numbers without saving it.
router.post(
  "/business/deal-analyses",
  validate({ body: DEAL_INPUTS }),
  async (req, res) => {
    res.status(200).json(analyzeDeal(req.validated.body));
  },
);

router.post(
  "/business/deals",
  validate({ body: NEW_DEAL }),
  async (req, res) => {
    res.status(201).json(await createDeal(req.validated.body));
  },
);

router.patch(
  "/business/deals/:id",
  validate({ params: ID_PARAMS, body: DEAL_CHANGES }),
  async (req, res) => {
    res.status(200).json(await editDeal(req.validated.params.id, req.validated.body));
  },
);

router.delete(
  "/business/deals/:id",
  validate({ params: ID_PARAMS }),
  async (req, res) => {
    await removeDeal(req.validated.params.id);
    res.status(204).end();
  },
);

export default router;
