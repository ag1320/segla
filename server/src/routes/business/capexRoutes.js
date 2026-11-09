import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import {
  createCapexComponent,
  editCapexComponent,
  removeCapexComponent,
  setCapexReserveAccount,
  getCapexPlan,
} from "../../services/business/capexService.js";
import { ID, ID_PARAMS, ISO_DATE, atLeastOneField } from "./schemaFields.js";

const COMPONENT_DETAILS = {
  name: z.string().trim().min(1).max(255),
  installYear: z.number().int().min(1900).max(2200),
  usefulLifeYears: z.number().int().positive().max(100),
  replacementCostCents: z.number().int().positive(),
};

const NEW_COMPONENT = z.strictObject({ propertyId: ID, ...COMPONENT_DETAILS });

const COMPONENT_CHANGES = atLeastOneField(z.strictObject(COMPONENT_DETAILS).partial());

const PLAN_QUERY = z.strictObject({ entityId: ID, asOfDate: ISO_DATE });

const RESERVE_ACCOUNT = z.strictObject({ accountId: ID.nullable() });

const router = Router();

// The plan lists every component, so there's no separate list route.
router.get(
  "/business/capex-plan",
  validate({ query: PLAN_QUERY }),
  async (req, res) => {
    res.status(200).json(await getCapexPlan(req.validated.query));
  },
);

router.post(
  "/business/capex-components",
  validate({ body: NEW_COMPONENT }),
  async (req, res) => {
    res.status(201).json(await createCapexComponent(req.validated.body));
  },
);

router.patch(
  "/business/capex-components/:id",
  validate({ params: ID_PARAMS, body: COMPONENT_CHANGES }),
  async (req, res) => {
    res.status(200).json(await editCapexComponent(req.validated.params.id, req.validated.body));
  },
);

router.delete(
  "/business/capex-components/:id",
  validate({ params: ID_PARAMS }),
  async (req, res) => {
    await removeCapexComponent(req.validated.params.id);
    res.status(204).end();
  },
);

router.put(
  "/business/entities/:id/capex-reserve-account",
  validate({ params: ID_PARAMS, body: RESERVE_ACCOUNT }),
  async (req, res) => {
    await setCapexReserveAccount(req.validated.params.id, req.validated.body.accountId);
    res.status(204).end();
  },
);

export default router;
