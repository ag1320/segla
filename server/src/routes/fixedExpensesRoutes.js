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
  let { category, aaron, oldCategory, jen, isDiscretionary } = req.body;
  isDiscretionary = Boolean(isDiscretionary);
  editFixedExpenseAaron(category, oldCategory, aaron, isDiscretionary)
    .then(() => editFixedExpenseJen(category, oldCategory, jen, isDiscretionary))
    .then(() => res.sendStatus(200))
    .catch((err) => sendError(res, err));
});

router.delete("/fixedExpenses", (req, res) => {
  let { category } = req.query;
  deleteFixedExpense(category)
    .then((data) => res.sendStatus(202))
    .catch((err) => sendError(res, err));
});

router.post("/fixedExpenses", (req, res) => {
  let { category, aaron, jen, isDiscretionary } = req.body;
  insertFixedExpense(category, aaron, jen, Boolean(isDiscretionary))
    .then((data) => res.sendStatus(202))
    .catch((err) => sendError(res, err));
});

export default router;
