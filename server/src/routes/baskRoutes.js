import { Router } from "express";
import {
  getBask,
  postBask,
  deleteBask,
  patchBask,
} from "../controllers/baskController.js";

const router = Router();

router.get("/bask", (req, res) => {
  getBask()
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

router.post("/bask", (req, res) => {
  let { interestRate, value, totalReturn, ytdReturn } = req.body;
  postBask(interestRate, value, totalReturn, ytdReturn)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

router.delete("/bask", (req, res) => {
  let { id } = req.query;
  deleteBask(id)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

router.patch("/bask", (req, res) => {
  let { interestRate, value, totalReturn, ytdReturn, id } = req.body;
  patchBask(interestRate, value, totalReturn, ytdReturn, id)
    .then((data) => res.sendStatus(201))
    .catch((err) => {
      res.status(403).send(err);
    });
});

export default router;
