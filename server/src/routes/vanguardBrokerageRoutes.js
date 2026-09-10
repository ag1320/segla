import { Router } from "express";
import {
  getVanguardBrokerage,
  postVanguardBrokerage,
  deleteVanguardBrokerage,
  patchVanguardBrokerage,
} from "../controllers/vanguardBrokerageController.js";
import { sendError } from "../utils/sendError.js";

const router = Router();

router.get("/vanguardBrokerage", (req, res) => {
  getVanguardBrokerage()
    .then((data) => res.status(200).send(data))
    .catch((err) => sendError(res, err));
});

router.post("/vanguardBrokerage", (req, res) => {
  let { accountHolder, accountType, value } = req.body;
  postVanguardBrokerage(accountHolder, accountType, value)
    .then((data) => res.status(200).send(data))
    .catch((err) => sendError(res, err));
});

router.delete("/vanguardBrokerage", (req, res) => {
  let { id } = req.query;
  deleteVanguardBrokerage(id)
    .then((data) => res.status(200).send(data))
    .catch((err) => sendError(res, err));
});

router.patch("/vanguardBrokerage", (req, res) => {
  let {
    accountHolder,
    accountType,
    value,
    totalReturn,
    totalReturnPercentage,
    ytdReturnPercentage,
    id,
  } = req.body;
  patchVanguardBrokerage(
    accountHolder,
    accountType,
    value,
    totalReturn,
    totalReturnPercentage,
    ytdReturnPercentage,
    id,
  )
    .then((data) => res.sendStatus(201))
    .catch((err) => sendError(res, err));
});

export default router;
