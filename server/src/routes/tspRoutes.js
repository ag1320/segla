import { Router } from "express";
import { getTsp, postTsp, deleteTsp, patchTsp } from "../controllers/tspController.js";

const router = Router();

router.get("/tsp", (req, res) => {
  getTsp()
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

router.post("/tsp", (req, res) => {
  let {
    accountHolder,
    accountType,
    value,
    totalReturn,
    contribution,
    govtContribution,
    ytdReturnPercentage,
  } = req.body;
  postTsp(
    accountHolder,
    accountType,
    value,
    totalReturn,
    contribution,
    govtContribution,
    ytdReturnPercentage,
  )
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

router.delete("/tsp", (req, res) => {
  let { id } = req.query;
  deleteTsp(id)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

router.patch("/tsp", (req, res) => {
  let {
    accountHolder,
    accountType,
    value,
    totalReturn,
    contribution,
    govtContribution,
    ytdReturnPercentage,
    id,
  } = req.body;
  console.log(
    "payload",
    accountHolder,
    accountType,
    value,
    totalReturn,
    contribution,
    govtContribution,
    ytdReturnPercentage,
    id,
  );
  patchTsp(
    accountHolder,
    accountType,
    value,
    totalReturn,
    contribution,
    govtContribution,
    ytdReturnPercentage,
    id,
  )
    .then((data) => res.sendStatus(201))
    .catch((err) => {
      res.status(403).send(err);
    });
});

export default router;
