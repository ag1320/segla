import { Router } from "express";
import {
  getCurrentBudgetCategories,
  getBudgetCategories,
  patchBudgetCategory,
  deleteBudgetCategory,
  postBudgetCategory,
} from "../controllers/budgetCategoriesController.js";
import { sendError } from "../utils/sendError.js";

const router = Router();

router.get("/currentBudgetCategories", (req, res) => {
  getCurrentBudgetCategories()
    .then((data) => res.status(200).send(data))
    .catch((err) => sendError(res, err));
});

router.get("/budgetCategories", (req, res) => {
  let { month, year } = req.query;
  getBudgetCategories(month, year)
    .then((data) => res.status(200).send(data))
    .catch((err) => sendError(res, err));
});

router.patch("/budgetCategories", (req, res) => {
  let { budgetRange } = req.body;
  let promisesRange = [];
  for (let budget of budgetRange) {
    let promiseRange = patchBudgetCategory(budget);
    promisesRange.push(promiseRange);
  }
  Promise.all(promisesRange)
    .then((data) => res.sendStatus(201))
    .catch((err) => sendError(res, err));
});

router.delete("/budgetCategories", (req, res) => {
  let { id } = req.query;
  deleteBudgetCategory(id)
    .then((data) => res.status(200).send(data))
    .catch((err) => sendError(res, err));
});

router.post("/budgetCategories", (req, res) => {
  let { category, range } = req.body;
  postBudgetCategory(category, range)
    .then((data) => res.sendStatus(202))
    .catch((err) => sendError(res, err));
});

export default router;
