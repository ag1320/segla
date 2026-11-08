import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import {
  listMortgages,
  createMortgage,
  editMortgage,
  removeMortgage,
  getMortgageSchedule,
  getMortgagePaymentSplit,
} from "../../services/business/mortgagesService.js";
import { ID, ID_PARAMS, ISO_DATE, CENTS, atLeastOneField } from "./schemaFields.js";

const MORTGAGE_TERMS = {
  lender: z.string().trim().min(1).max(255),
  originalPrincipalCents: z.number().int().positive(),
  // A yearly percentage with up to 4 decimals: 2.75 means 2.75%.
  annualRatePercent: z.number().min(0).max(99).multipleOf(0.0001),
  termMonths: z.number().int().positive().max(600),
  firstPaymentDate: ISO_DATE,
  monthlyEscrowCents: CENTS,
};

const NEW_MORTGAGE = z.strictObject({ propertyId: ID, ...MORTGAGE_TERMS });

const MORTGAGE_CHANGES = atLeastOneField(z.strictObject(MORTGAGE_TERMS).partial());

const PAYMENT_SPLIT_QUERY = z.strictObject({ date: ISO_DATE });

const router = Router();

router.get("/business/mortgages", async (req, res) => {
  res.status(200).json(await listMortgages());
});

router.post(
  "/business/mortgages",
  validate({ body: NEW_MORTGAGE }),
  async (req, res) => {
    res.status(201).json(await createMortgage(req.validated.body));
  },
);

router.patch(
  "/business/mortgages/:id",
  validate({ params: ID_PARAMS, body: MORTGAGE_CHANGES }),
  async (req, res) => {
    res.status(200).json(await editMortgage(req.validated.params.id, req.validated.body));
  },
);

router.delete(
  "/business/mortgages/:id",
  validate({ params: ID_PARAMS }),
  async (req, res) => {
    await removeMortgage(req.validated.params.id);
    res.status(204).end();
  },
);

router.get(
  "/business/mortgages/:id/schedule",
  validate({ params: ID_PARAMS }),
  async (req, res) => {
    res.status(200).json(await getMortgageSchedule(req.validated.params.id));
  },
);

router.get(
  "/business/mortgages/:id/payment-split",
  validate({ params: ID_PARAMS, query: PAYMENT_SPLIT_QUERY }),
  async (req, res) => {
    const split = await getMortgagePaymentSplit(req.validated.params.id, req.validated.query.date);
    res.status(200).json(split);
  },
);

export default router;
