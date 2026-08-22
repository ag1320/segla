import { Router } from "express";
import {
  getFixedIncome,
  editFixedIncome,
  deleteFixedIncome,
  insertFixedIncome,
} from "../controllers/fixedIncomeController.js";

const router = Router();

router.get("/fixedIncome", (req, res) => {
  getFixedIncome()
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

router.patch("/fixedIncome", (req, res) => {
  let { source, amount, id } = req.body;
  editFixedIncome(source, id, amount)
    .then((data) => res.sendStatus(201))
    .catch((err) => {
      console.log(err);
      res.status(403).send(err);
    });
});

router.delete("/fixedIncome", (req, res) => {
  let { source } = req.query;
  deleteFixedIncome(source)
    .then((data) => res.sendStatus(202))
    .catch((err) => res.status(403).send(err));
});

router.post("/fixedIncome", (req, res) => {
  let { source, amount } = req.body;
  insertFixedIncome(source, amount)
    .then((data) => res.sendStatus(202))
    .catch((err) => res.status(403).send(err));
});

export default router;
