import { Router } from "express";
import {
  getPa529,
  postPa529,
  deletePa529,
  patchPa529,
} from "../controllers/pa529Controller.js";
import { sendError } from "../utils/sendError.js";

const router = Router();

router.get("/pa529", (req, res) => {
  getPa529()
    .then((data) => res.status(200).send(data))
    .catch((err) => sendError(res, err));
});

router.post("/pa529", (req, res) => {
  let { beneficiary, value, totalReturn, year } = req.body;
  postPa529(beneficiary, value, totalReturn, year)
    .then((data) => res.status(200).send(data))
    .catch((err) => sendError(res, err));
});

router.delete("/pa529", (req, res) => {
  let { id } = req.query;
  deletePa529(id)
    .then((data) => res.status(200).send(data))
    .catch((err) => sendError(res, err));
});

router.patch("/pa529", (req, res) => {
  let { beneficiary, value, totalReturn, year, id } = req.body;
  patchPa529(beneficiary, value, totalReturn, year, id)
    .then((data) => res.sendStatus(201))
    .catch((err) => sendError(res, err));
});

export default router;
