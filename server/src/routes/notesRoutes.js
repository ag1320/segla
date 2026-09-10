import { Router } from "express";
import {
  exportCSV,
  postNote,
  getNotes,
  deleteNote,
} from "../controllers/notesController.js";
import { sendError } from "../utils/sendError.js";

const router = Router();

router.get("/exportCSV", (req, res) => {
  let { month, year, isExported } = req.query;
  let title = "Exported";
  let details = "This month's budget was exported.";
  let exportPromises = [];
  let exportPromise = exportCSV(month, year);
  exportPromises.push(exportPromise);
  if (isExported === "false") {
    let notePromise = postNote(title, details, month, year);
    exportPromises.push(notePromise);
  }
  Promise.all(exportPromises)
    .then(([csvString]) => {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="Budget-${month}-${year}.csv"`
      );
      res.status(200).send(csvString);
    })
    .catch((err) => sendError(res, err));
});

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
