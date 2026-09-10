import { Router } from "express";
import {
  getFixedExpenses,
  editFixedExpenseAaron,
  editFixedExpenseJen,
  deleteFixedExpense,
  insertFixedExpense,
} from "../controllers/fixedExpensesController.js";
import { sendError } from "../utils/sendError.js";

const router = Router();

router.get("/fixedExpenses", (req, res) => {
  getFixedExpenses()
    .then((data) => res.status(200).send(data))
    .catch((err) => sendError(res, err));
});

router.patch("/fixedExpenses", (req, res) => {
  let { category, aaron, oldCategory, jen } = req.body;
  editFixedExpenseAaron(category, oldCategory, aaron)
    .then((data) => {
      editFixedExpenseJen(category, oldCategory, jen);
    })
    .then((data) => res.status(200).send(data))
    .catch((err) => sendError(res, err));
});

router.delete("/fixedExpenses", (req, res) => {
  let { category } = req.query;
  deleteFixedExpense(category)
    .then((data) => res.sendStatus(202))
    .catch((err) => sendError(res, err));
});

router.post("/fixedExpenses", (req, res) => {
  let { category, aaron, jen } = req.body;
  insertFixedExpense(category, aaron, jen)
    .then((data) => res.sendStatus(202))
    .catch((err) => sendError(res, err));
});

export default router;
