import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import {
  listFixedAssets,
  createFixedAsset,
  editFixedAsset,
  removeFixedAsset,
  setCpaDepreciation,
  clearCpaDepreciation,
} from "../../services/business/fixedAssetsService.js";
import { postDepreciationThrough } from "../../services/business/depreciationPostingService.js";
import { ID, ID_PARAMS, ISO_DATE, CENTS, atLeastOneField } from "./schemaFields.js";

const ASSET_CLASSES = ["land", "building", "building_improvement", "land_improvement", "furnishings"];

const FIXED_ASSET_DETAILS = {
  name: z.string().trim().min(1).max(255),
  assetClass: z.enum(ASSET_CLASSES),
  costCents: z.number().int().positive(),
  inServiceDate: ISO_DATE,
  disposalDate: ISO_DATE.nullable().optional(),
  carryoverFromFixedAssetId: ID.nullable().optional(),
};

const NEW_FIXED_ASSET = z.strictObject({ propertyId: ID, ...FIXED_ASSET_DETAILS });

const FIXED_ASSET_CHANGES = atLeastOneField(z.strictObject(FIXED_ASSET_DETAILS).partial());

const LIST_QUERY = z.strictObject({ asOfDate: ISO_DATE });

const CPA_PARAMS = z.strictObject({ id: ID, taxYear: z.coerce.number().int().min(2000).max(2100) });

const CPA_AMOUNT = z.strictObject({ amountCents: CENTS });

const DEPRECIATION_POSTING = z.strictObject({ entityId: ID, throughDate: ISO_DATE });

const router = Router();

router.get(
  "/business/fixed-assets",
  validate({ query: LIST_QUERY }),
  async (req, res) => {
    res.status(200).json(await listFixedAssets(req.validated.query.asOfDate));
  },
);

router.post(
  "/business/fixed-assets",
  validate({ body: NEW_FIXED_ASSET }),
  async (req, res) => {
    res.status(201).json(await createFixedAsset(req.validated.body));
  },
);

router.patch(
  "/business/fixed-assets/:id",
  validate({ params: ID_PARAMS, body: FIXED_ASSET_CHANGES }),
  async (req, res) => {
    res.status(200).json(await editFixedAsset(req.validated.params.id, req.validated.body));
  },
);

router.delete(
  "/business/fixed-assets/:id",
  validate({ params: ID_PARAMS }),
  async (req, res) => {
    await removeFixedAsset(req.validated.params.id);
    res.status(204).end();
  },
);

router.put(
  "/business/fixed-assets/:id/cpa-depreciation/:taxYear",
  validate({ params: CPA_PARAMS, body: CPA_AMOUNT }),
  async (req, res) => {
    const { id, taxYear } = req.validated.params;
    await setCpaDepreciation({ fixedAssetId: id, taxYear, amountCents: req.validated.body.amountCents });
    res.status(204).end();
  },
);

router.delete(
  "/business/fixed-assets/:id/cpa-depreciation/:taxYear",
  validate({ params: CPA_PARAMS }),
  async (req, res) => {
    const { id, taxYear } = req.validated.params;
    await clearCpaDepreciation({ fixedAssetId: id, taxYear });
    res.status(204).end();
  },
);

router.post(
  "/business/depreciation-postings",
  validate({ body: DEPRECIATION_POSTING }),
  async (req, res) => {
    res.status(201).json(await postDepreciationThrough(req.validated.body));
  },
);

export default router;
