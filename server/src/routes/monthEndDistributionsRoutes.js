import { Router } from "express";
import {
  getMonthEndDistributions,
  postMonthEndDistribution,
  deleteMonthEndDistribution,
} from "../controllers/monthEndDistributionsController.js";
import { sendError } from "../utils/sendError.js";

const router = Router();

router.get("/monthEndDistributions", (req, res) => {
  let { month, year } = req.query;
  getMonthEndDistributions(month, year)
    .then((data) => res.status(200).send(data))
    .catch((err) => sendError(res, err));
});

router.post("/monthEndDistributions", (req, res) => {
  let { category, amount, month, year } = req.body;
  postMonthEndDistribution(category, amount, month, year)
    .then((data) => res.sendStatus(202))
    .catch((err) => sendError(res, err));
});

router.delete("/monthEndDistributions", (req, res) => {
  let { id } = req.query;
  deleteMonthEndDistribution(id)
    .then((data) => res.status(200).send(data))
    .catch((err) => sendError(res, err));
});

export default router;
