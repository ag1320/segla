import { Router } from "express";
import {
  getMonthlyExpenses,
  getCategoryId,
  insertVariedExpense,
  getMonthlyVariedExpenses,
  deleteMonthlyVariedExpenses,
} from "../controllers/monthlyExpensesController.js";

const router = Router();

router.get("/monthlyExpenses", (req, res) => {
  let { month, year, type } = req.query;
  getMonthlyExpenses(month, year, type)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

router.post("/monthlyExpenses", (req, res) => {
  let { category, subcategory, amount, month, year } = req.body;
  getCategoryId(category, subcategory, month, year)
    .then((id) => {
      insertVariedExpense(id, amount, month, year)
        .then((data) => res.sendStatus(202))
        .catch((err) => res.status(403).send(err));
    })
    .catch((err) => res.status(403).send(err));
});

router.get("/monthlyVariedExpenses", (req, res) => {
  let { month, year, type } = req.query;
  getMonthlyVariedExpenses(month, year, type)
    .then((data) => res.status(200).send(data))
    .catch((err) => {
      console.log(err);
      res.status(403).send(err);
    });
});

router.delete("/monthlyVariedExpenses", (req, res) => {
  let { id } = req.query;
  deleteMonthlyVariedExpenses(id)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

export default router;
