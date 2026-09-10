import { Router } from "express";
import { getTsp, postTsp, deleteTsp, patchTsp } from "../controllers/tspController.js";
import { sendError } from "../utils/sendError.js";

const router = Router();

router.get("/tsp", (req, res) => {
  getTsp()
    .then((data) => res.status(200).send(data))
    .catch((err) => sendError(res, err));
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
    .catch((err) => sendError(res, err));
});

router.delete("/tsp", (req, res) => {
  let { id } = req.query;
  deleteTsp(id)
    .then((data) => res.status(200).send(data))
    .catch((err) => sendError(res, err));
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
    .catch((err) => sendError(res, err));
});

export default router;
