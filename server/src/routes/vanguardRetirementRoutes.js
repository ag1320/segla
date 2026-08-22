import { Router } from "express";
import {
  getVanguardRetirement,
  postVanguardRetirement,
  deleteVanguardRetirement,
  patchVanguardRetirement,
} from "../controllers/vanguardRetirementController.js";

const router = Router();

router.get("/vanguardRetirement", (req, res) => {
  getVanguardRetirement()
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

router.post("/vanguardRetirement", (req, res) => {
  let { accountHolder, accountType, value } = req.body;
  postVanguardRetirement(accountHolder, accountType, value)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

router.delete("/vanguardRetirement", (req, res) => {
  let { id } = req.query;
  deleteVanguardRetirement(id)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
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
    .catch((err) => {
      res.status(403).send(err);
    });
});

export default router;
