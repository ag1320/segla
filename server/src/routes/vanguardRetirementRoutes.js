import { Router } from "express";
import {
  getVanguardRetirement,
  postVanguardRetirement,
  deleteVanguardRetirement,
  patchVanguardRetirement,
} from "../controllers/vanguardRetirementController.js";
import { sendError } from "../utils/sendError.js";

const router = Router();

router.get("/vanguardRetirement", (req, res) => {
  getVanguardRetirement()
    .then((data) => res.status(200).send(data))
    .catch((err) => sendError(res, err));
});

router.post("/vanguardRetirement", (req, res) => {
  let { accountHolder, accountType, value } = req.body;
  postVanguardRetirement(accountHolder, accountType, value)
    .then((data) => res.status(200).send(data))
    .catch((err) => sendError(res, err));
});

router.delete("/vanguardRetirement", (req, res) => {
  let { id } = req.query;
  deleteVanguardRetirement(id)
    .then((data) => res.status(200).send(data))
    .catch((err) => sendError(res, err));
});

router.patch("/vanguardRetirement", (req, res) => {
  let {
    accountHolder,
    accountType,
    value,
    totalReturn,
    totalReturnPercentage,
    ytdReturnPercentage,
    id,
  } = req.body;
  patchVanguardRetirement(
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
