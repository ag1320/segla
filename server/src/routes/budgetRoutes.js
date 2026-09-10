import { Router } from "express";
import {
  checkBudget,
  postIncome,
  postFixedExpense,
  deleteMonthlyExpenses,
} from "../controllers/budgetController.js";
import { postBudgetCategories, deleteBudgetCategories } from "../controllers/budgetCategoriesController.js";
import { deleteNotes } from "../controllers/notesController.js";
import { sendError } from "../utils/sendError.js";

const router = Router();

router.post("/budget/check", (req, res) => {
  let { month, year } = req.body;
  checkBudget(month, year)
    .then((data) => res.status(200).send(data))
    .catch((err) => sendError(res, err));
});

router.post("/budget", (req, res) => {
  let promisesIncome = [];
  let promisesExpense = [];
  let promisesBudgetCategories = [];
  let { fixedExpenses, fixedIncome, month, year, currentBudgetCategories } =
    req.body;
  for (let item of fixedIncome) {
    let promiseIncome = postIncome(item, month, year);
    promisesIncome.push(promiseIncome);
  }
  Promise.all(promisesIncome).then(() => {
    for (let expense of fixedExpenses) {
      let promiseExpense = postFixedExpense(expense, month, year);
      promisesExpense.push(promiseExpense);
    }
    Promise.all(promisesExpense).then(() => {
      for (let category of currentBudgetCategories) {
        let promiseCategory = postBudgetCategories(category, month, year);
        promisesBudgetCategories.push(promiseCategory);
      }
      Promise.all(promisesBudgetCategories)
        .then((data) => res.status(201).send(data))
        .catch((err) => sendError(res, err));
    });
  });
});

router.delete("/budget", (req, res) => {
  let { month, year } = req.query;
  let budgetPromises = [];
  let expensesPromise = deleteMonthlyExpenses(month, year);
  let categoriesPromise = deleteBudgetCategories(month, year);
  let notesPromise = deleteNotes(month, year);
  budgetPromises.push(expensesPromise, categoriesPromise, notesPromise);
  Promise.all(budgetPromises)
    .then((data) => res.status(200).send(data))
    .catch((err) => sendError(res, err));
});

export default router;
