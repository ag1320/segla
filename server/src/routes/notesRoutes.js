import { Router } from "express";
import {
  postNote,
  getNotes,
  deleteNote,
} from "../controllers/notesController.js";
import { sendError } from "../utils/sendError.js";

const router = Router();

router.post("/notes", (req, res) => {
  let { title, details, month, year } = req.body;
  postNote(title, details, month, year)
    .then((data) => res.sendStatus(202))
    .catch((err) => sendError(res, err));
});

router.get("/notes", (req, res) => {
  let { month, year } = req.query;
  getNotes(month, year)
    .then((data) => res.status(200).send(data))
    .catch((err) => sendError(res, err));
});

router.delete("/notes", (req, res) => {
  let { id } = req.query;
  deleteNote(id)
    .then((data) => res.status(200).send(data))
    .catch((err) => sendError(res, err));
});

export default router;
