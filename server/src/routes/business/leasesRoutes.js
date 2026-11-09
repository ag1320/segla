import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import {
  listLeases,
  createLease,
  editLease,
  removeLease,
  keepDeposit,
  getRentRoll,
} from "../../services/business/leasesService.js";
import { ID, ID_PARAMS, ISO_DATE, CENTS, atLeastOneField } from "./schemaFields.js";

const LEASE_DETAILS = {
  tenantName: z.string().trim().min(1).max(255),
  unit: z.string().trim().max(50).nullable().optional(),
  startDate: ISO_DATE,
  endDate: ISO_DATE.nullable().optional(),
  moveOutDate: ISO_DATE.nullable().optional(),
  monthlyRentCents: z.number().int().positive(),
  depositCents: CENTS.optional(),
};

const NEW_LEASE = z.strictObject({ propertyId: ID, ...LEASE_DETAILS });

const LEASE_CHANGES = atLeastOneField(z.strictObject(LEASE_DETAILS).partial());

const AS_OF_QUERY = z.strictObject({ asOfDate: ISO_DATE });

const RENT_ROLL_QUERY = z.strictObject({ entityId: ID, asOfDate: ISO_DATE });

const DEPOSIT_KEPT = z.strictObject({ entryDate: ISO_DATE, amountCents: z.number().int().positive() });

const router = Router();

router.get(
  "/business/leases",
  validate({ query: AS_OF_QUERY }),
  async (req, res) => {
    res.status(200).json(await listLeases(req.validated.query.asOfDate));
  },
);

router.post(
  "/business/leases",
  validate({ body: NEW_LEASE }),
  async (req, res) => {
    res.status(201).json(await createLease(req.validated.body));
  },
);

router.patch(
  "/business/leases/:id",
  validate({ params: ID_PARAMS, body: LEASE_CHANGES }),
  async (req, res) => {
    res.status(200).json(await editLease(req.validated.params.id, req.validated.body));
  },
);

router.delete(
  "/business/leases/:id",
  validate({ params: ID_PARAMS }),
  async (req, res) => {
    await removeLease(req.validated.params.id);
    res.status(204).end();
  },
);

// Posts the part of a deposit kept for damages or unpaid rent as income.
router.post(
  "/business/leases/:id/deposit-kept",
  validate({ params: ID_PARAMS, body: DEPOSIT_KEPT }),
  async (req, res) => {
    res.status(201).json(await keepDeposit(req.validated.params.id, req.validated.body));
  },
);

router.get(
  "/business/reports/rent-roll",
  validate({ query: RENT_ROLL_QUERY }),
  async (req, res) => {
    res.status(200).json(await getRentRoll(req.validated.query));
  },
);

export default router;
