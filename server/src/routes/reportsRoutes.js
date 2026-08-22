import { Router } from "express";
import {
  getReportData,
  getReportDataTotal,
  getReportDataWarningsAndLimits,
} from "../controllers/reportsController.js";

const router = Router();

router.get("/reportData", (req, res) => {
  let { startDateString, endDateString, formattedCategories, reason } =
    req.query;
  if (reason === "total") {
    getReportDataTotal(startDateString, endDateString)
      .then((data) => res.status(200).send(data))
      .catch((err) => res.status(403).send(err));
  } else if (reason === "warningsAndLimits") {
    getReportDataWarningsAndLimits(
      startDateString,
      endDateString,
      formattedCategories,
    )
      .then((data) => res.status(200).send(data))
      .catch((err) => res.status(403).send(err));
  } else {
    getReportData(startDateString, endDateString, formattedCategories)
      .then((data) => res.status(200).send(data))
      .catch((err) => res.status(403).send(err));
  }
});

export default router;
