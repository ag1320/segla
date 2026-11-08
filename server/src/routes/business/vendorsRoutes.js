import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import { findVendors } from "../../controllers/business/vendorsController.js";
import { createVendor, editVendor } from "../../services/business/vendorsService.js";
import { ID_PARAMS, atLeastOneField } from "./schemaFields.js";

// w9Location says where the W-9 is kept (a folder or file name), never the
// tax ID itself.
const VENDOR_DETAILS = {
  name: z.string().trim().min(1).max(255),
  is1099Eligible: z.boolean().optional(),
  hasW9OnFile: z.boolean().optional(),
  w9Location: z.string().trim().max(255).nullable().optional(),
  isActive: z.boolean().optional(),
};

const NEW_VENDOR = z.strictObject(VENDOR_DETAILS);

const VENDOR_CHANGES = atLeastOneField(z.strictObject(VENDOR_DETAILS).partial());

const router = Router();

router.get("/business/vendors", async (req, res) => {
  res.status(200).json(await findVendors());
});

router.post(
  "/business/vendors",
  validate({ body: NEW_VENDOR }),
  async (req, res) => {
    res.status(201).json(await createVendor(req.validated.body));
  },
);

router.patch(
  "/business/vendors/:id",
  validate({ params: ID_PARAMS, body: VENDOR_CHANGES }),
  async (req, res) => {
    res.status(200).json(await editVendor(req.validated.params.id, req.validated.body));
  },
);

export default router;
