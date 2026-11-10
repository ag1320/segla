import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import { getPackageFile, PACKAGE_FILES } from "../../services/business/cpaPackageService.js";
import { ALLOCATION_METHODS } from "../../services/business/scheduleEService.js";
import { ID } from "./schemaFields.js";

const FILE_PARAMS = z.strictObject({ file: z.enum(Object.keys(PACKAGE_FILES)) });

const PACKAGE_QUERY = z.strictObject({
  entityId: ID,
  taxYear: z.coerce.number().int().min(2000).max(2100),
  allocation: z.enum(ALLOCATION_METHODS).default("equal"),
});

const router = Router();

// The files in the year-end package, for the page to list.
router.get("/business/cpa-package", (req, res) => {
  res.status(200).json(Object.entries(PACKAGE_FILES).map(([file, { title }]) => ({ file, title })));
});

// One file's rows, ready to save as a CSV.
router.get(
  "/business/cpa-package/:file",
  validate({ params: FILE_PARAMS, query: PACKAGE_QUERY }),
  async (req, res) => {
    res.status(200).json(await getPackageFile({ file: req.validated.params.file, ...req.validated.query }));
  },
);

export default router;
