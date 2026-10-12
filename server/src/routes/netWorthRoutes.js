import { Router } from "express";
import {
  getSnapshots,
  captureSnapshot,
  deleteSnapshot,
} from "../controllers/netWorthController.js";
import { sendError } from "../utils/sendError.js";

const router = Router();

router.get("/netWorthSnapshots", (req, res) => {
  getSnapshots()
    .then((data) => res.status(200).send(data))
    .catch((err) => sendError(res, err));
});

// "Capture Now" - snapshots are also taken automatically, see
// middleware/snapshotOnChange.js
router.post("/netWorthSnapshots", (req, res) => {
  captureSnapshot("manual")
    .then((data) => res.status(200).send(data))
    .catch((err) => sendError(res, err));
});

router.delete("/netWorthSnapshots", (req, res) => {
  let { id } = req.query;
  deleteSnapshot(id)
    .then((data) => res.status(200).send({ deleted: data }))
    .catch((err) => sendError(res, err));
});

export default router;
