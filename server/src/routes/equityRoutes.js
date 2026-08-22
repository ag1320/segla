import { Router } from "express";
import {
  getEquity,
  postEquity,
  deleteEquity,
  patchEquity,
} from "../controllers/equityController.js";

const router = Router();

router.get("/equity", (req, res) => {
  getEquity()
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

router.post("/equity", (req, res) => {
  let { address, valuation, remainingBalance } = req.body;
  postEquity(address, valuation, remainingBalance)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

router.delete("/equity", (req, res) => {
  let { id } = req.query;
  deleteEquity(id)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

router.patch("/equity", (req, res) => {
  let { address, valuation, remainingBalance, id } = req.body;
  patchEquity(address, valuation, remainingBalance, id)
    .then((data) => res.sendStatus(201))
    .catch((err) => {
      res.status(403).send(err);
    });
});

export default router;
