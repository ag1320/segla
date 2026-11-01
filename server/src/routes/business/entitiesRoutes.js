import { Router } from "express";
import { findEntities } from "../../controllers/business/entitiesController.js";

const router = Router();

router.get("/business/entities", async (req, res) => {
  res.status(200).json(await findEntities());
});

export default router;
