import { Router } from "express";
import {
  getCrypto,
  postCrypto,
  deleteCrypto,
  patchCrypto,
  fetchCryptoMarketData,
} from "../controllers/cryptoController.js";

const router = Router();

router.get("/crypto", (req, res) => {
  getCrypto()
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

router.post("/crypto", (req, res) => {
  let { ticker, name, url, shares, totalSpent } = req.body;
  postCrypto(ticker, name, url, shares, totalSpent)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

router.delete("/crypto", (req, res) => {
  let { id } = req.query;
  deleteCrypto(id)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

router.patch("/crypto", (req, res) => {
  let { ticker, name, url, shares, totalSpent, id } = req.body;
  patchCrypto(ticker, name, url, shares, totalSpent, id)
    .then((data) => res.sendStatus(201))
    .catch((err) => {
      res.status(403).send(err);
    });
});

router.get("/crypto-market", (req, res) => {
  let { idTags } = req.query;
  fetchCryptoMarketData(idTags)
    .then((data) => res.status(200).send(data.data))
    .catch((err) => res.status(403).send(err));
});

export default router;
