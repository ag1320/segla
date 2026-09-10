import { Router } from "express";
import {
  getEquity,
  postEquity,
  deleteEquity,
  patchEquity,
} from "../controllers/equityController.js";
import { sendError } from "../utils/sendError.js";

const router = Router();

router.get("/equity", (req, res) => {
  getEquity()
    .then((data) => res.status(200).send(data))
    .catch((err) => sendError(res, err));
});

router.post("/equity", (req, res) => {
  let { address, valuation, remainingBalance } = req.body;
  postEquity(address, valuation, remainingBalance)
    .then((data) => res.status(200).send(data))
    .catch((err) => sendError(res, err));
});

router.delete("/equity", (req, res) => {
  let { id } = req.query;
  deleteEquity(id)
    .then((data) => res.status(200).send(data))
    .catch((err) => sendError(res, err));
});

router.patch("/equity", (req, res) => {
  let { address, valuation, remainingBalance, id } = req.body;
  patchEquity(address, valuation, remainingBalance, id)
    .then((data) => res.sendStatus(201))
    .catch((err) => sendError(res, err));
});

export default router;
