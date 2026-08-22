import { Router } from "express";
import {
  getLoans,
  postLoans,
  deleteLoans,
  patchLoans,
} from "../controllers/loansController.js";

const router = Router();

router.get("/loans", (req, res) => {
  getLoans()
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

router.post("/loans", (req, res) => {
  let {
    url,
    holder,
    interestRate,
    payoffDate,
    monthlyPayment,
    remainingBalance,
    type,
  } = req.body;
  postLoans(
    url,
    holder,
    interestRate,
    payoffDate,
    monthlyPayment,
    remainingBalance,
    type,
  )
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

router.delete("/loans", (req, res) => {
  let { id } = req.query;
  deleteLoans(id)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

router.patch("/loans", (req, res) => {
  let {
    url,
    holder,
    interestRate,
    payoffDate,
    monthlyPayment,
    remainingBalance,
    id,
  } = req.body;
  patchLoans(
    url,
    holder,
    interestRate,
    payoffDate,
    monthlyPayment,
    remainingBalance,
    id,
  )
    .then((data) => res.sendStatus(201))
    .catch((err) => {
      res.status(403).send(err);
    });
});

export default router;
