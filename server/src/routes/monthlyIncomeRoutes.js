import { Router } from "express";
import {
  getMonthlyIncome,
  postMonthlyIncome,
  deleteMonthlyIncome,
} from "../controllers/monthlyIncomeController.js";

const router = Router();

router.get("/monthlyIncome", (req, res) => {
  let { month, year } = req.query;
  getMonthlyIncome(month, year)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

router.post("/monthlyIncome", (req, res) => {
  let { category, amount, month, year } = req.body;
  postMonthlyIncome(category, amount, month, year)
    .then((data) => res.sendStatus(202))
    .catch((err) => res.status(403).send(err));
});

router.delete("/monthlyIncome", (req, res) => {
  let { id } = req.query;
  deleteMonthlyIncome(id)
    .then((data) => res.sendStatus(202))
    .catch((err) => res.status(403).send(err));
});

export default router;
