import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import { findRules } from "../../controllers/business/rulesController.js";
import {
  createRule,
  editRule,
  removeRule,
} from "../../services/business/rulesService.js";
import { ID, ID_PARAMS, DESCRIPTION_PATTERN, atLeastOneField } from "./schemaFields.js";

// propertyId and vendorId are null for company-wide or no vendor.
const RULE_DETAILS = {
  descriptionPattern: DESCRIPTION_PATTERN,
  accountId: ID,
  propertyId: ID.nullable().optional(),
  vendorId: ID.nullable().optional(),
};

const NEW_RULE = z.strictObject(RULE_DETAILS);

const RULE_CHANGES = atLeastOneField(z.strictObject(RULE_DETAILS).partial());

const router = Router();

router.get("/business/rules", async (req, res) => {
  res.status(200).json(await findRules());
});

router.post(
  "/business/rules",
  validate({ body: NEW_RULE }),
  async (req, res) => {
    res.status(201).json(await createRule(req.validated.body));
  },
);

router.patch(
  "/business/rules/:id",
  validate({ params: ID_PARAMS, body: RULE_CHANGES }),
  async (req, res) => {
    res.status(200).json(await editRule(req.validated.params.id, req.validated.body));
  },
);

router.delete(
  "/business/rules/:id",
  validate({ params: ID_PARAMS }),
  async (req, res) => {
    await removeRule(req.validated.params.id);
    res.status(204).end();
  },
);

export default router;
