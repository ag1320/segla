import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import { findProperties } from "../../controllers/business/propertiesController.js";
import {
  createProperty,
  editProperty,
} from "../../services/business/propertiesService.js";
import {
  ID,
  ID_PARAMS,
  ISO_DATE,
  CENTS,
  atLeastOneField,
} from "./schemaFields.js";

const PROPERTY_STATUSES = ["pre_rental", "active", "sold", "exchanged"];

// Every field but the name can be cleared with null.
const PROPERTY_DETAILS = {
  name: z.string().trim().min(1).max(255),
  address: z.string().trim().max(255).nullable().optional(),
  status: z.enum(PROPERTY_STATUSES).optional(),
  targetConversionDate: ISO_DATE.nullable().optional(),
  placedInServiceDate: ISO_DATE.nullable().optional(),
  landBasisCents: CENTS.nullable().optional(),
  buildingBasisCents: CENTS.nullable().optional(),
  marketRentCents: z.number().int().positive().nullable().optional(),
};

const NEW_PROPERTY = z.strictObject({ entityId: ID, ...PROPERTY_DETAILS });

const PROPERTY_CHANGES = atLeastOneField(
  z.strictObject(PROPERTY_DETAILS).partial(),
);

const router = Router();

router.get("/business/properties", async (req, res) => {
  res.status(200).json(await findProperties());
});

router.post(
  "/business/properties",
  validate({ body: NEW_PROPERTY }),
  async (req, res) => {
    res.status(201).json(await createProperty(req.validated.body));
  },
);

router.patch(
  "/business/properties/:id",
  validate({ params: ID_PARAMS, body: PROPERTY_CHANGES }),
  async (req, res) => {
    const property = await editProperty(
      req.validated.params.id,
      req.validated.body,
    );
    res.status(200).json(property);
  },
);

export default router;
