import { Router } from "express";
import {
  getCrypto,
  postCrypto,
  deleteCrypto,
  patchCrypto,
  fetchCryptoMarketData,
} from "../controllers/cryptoController.js";
import { sendError } from "../utils/sendError.js";

const router = Router();

router.get("/crypto", (req, res) => {
  getCrypto()
    .then((data) => res.status(200).send(data))
    .catch((err) => sendError(res, err));
});

router.post("/crypto", (req, res) => {
  let { ticker, name, url, shares, totalSpent } = req.body;
  postCrypto(ticker, name, url, shares, totalSpent)
    .then((data) => res.status(200).send(data))
    .catch((err) => sendError(res, err));
});

router.delete("/crypto", (req, res) => {
  let { id } = req.query;
  deleteCrypto(id)
    .then((data) => res.status(200).send(data))
    .catch((err) => sendError(res, err));
});

router.patch("/crypto", (req, res) => {
  let { ticker, name, url, shares, totalSpent, id } = req.body;
  patchCrypto(ticker, name, url, shares, totalSpent, id)
    .then((data) => res.sendStatus(201))
    .catch((err) => sendError(res, err));
});

router.get("/crypto-market", (req, res) => {
  let { idTags } = req.query;
  fetchCryptoMarketData(idTags)
    .then((data) => res.status(200).send(data.data))
    .catch((err) => sendError(res, err));
});

export default router;
