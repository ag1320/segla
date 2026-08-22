import { Router } from "express";
import _ from "lodash";
import {
  getTickers,
  insertTicker,
  insertTransaction,
  getTradTransactions,
  getCryptoTransactions,
  fetchData,
  splitTickers,
  findError,
  updatePrice,
  getShares,
  deleteTransactions,
  deleteTicker,
  patchShares,
} from "../controllers/investmentsLegacyController.js";

const router = Router();

/*
**********************************************
              INVESTMENTS OLD
**********************************************
*/
router.get("/data", (req, res) => {
  let { account } = req.query;
  let result = {};
  let promises = [];
  let errorTickers = [];
  getTradTransactions(account).then((data) => {
    let transactionsFull = data;
    getCryptoTransactions(account).then((data) => {
      transactionsFull = transactionsFull.concat(data);
      let tickersFull = Array.from(
        new Set(transactionsFull.map((transaction) => transaction.ticker)),
      );

      let tickers = splitTickers(tickersFull);

      for (let array of tickers) {
        let tickerString = array.join(",");
        fetchData(tickerString).then((data) => {
          //Incorrect API key
          if (data.response?.status == 403) {
            res.status(403).send(data.response.data.hint);
          } else {
            let response = data.data.quoteResponse.result;
            if (response.length !== array.length) {
              errorTickers = findError(response, array);
            }
            for (let quote of response) {
              let { symbol, regularMarketPrice, shortName, quoteType } = quote;
              updatePrice(symbol, regularMarketPrice, shortName, quoteType);
              let promise = getShares(symbol, quoteType).then((data) => {
                let shares = data[0].totalShares;
                let expenseRatio = data[0]?.expenseRatio;
                let transactions = transactionsFull.filter(
                  (el) => el.ticker === symbol,
                );
                let asset = transactions[0].asset;
                let detailedAsset = transactions[0].detailedAsset;
                for (let i = 0; i < transactions.length; i++) {
                  transactions[i] = _.omit(transactions[i], [
                    "asset",
                    "detailedAsset",
                    "expenseRatio",
                    "created_at",
                    "updated_at",
                    "description",
                    "marketPrice",
                    "name",
                    "totalShares",
                  ]);
                }
                result[symbol] = {
                  price: regularMarketPrice,
                  name: shortName,
                  shares,
                  expenseRatio,
                  asset,
                  detailedAsset,
                  transactions: transactions,
                };
              });
              promises.push(promise);
            }
            result.errorTickers = errorTickers;
            Promise.all(promises)
              .then(() => {
                res.status(200).send(result);
              })
              .catch((err) => res.status(400).send(err));
          }
        });
      }
    });
  });
});

router.get("/ticker", (req, res) => {
  let { ticker } = req.query;
  fetchData(ticker).then((data) => {
    res.send(data?.data?.quoteResponse?.result?.[0]?.shortName);
  });
});

router.delete("/ticker", (req, res) => {
  let { id, asset, owner } = req.query;
  deleteTransactions(id, asset, owner)
    .then(() => {
      deleteTicker(id, asset);
    })
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

router.patch("/shares", (req, res) => {
  let { id, asset, shares } = req.body;
  patchShares(id, asset, shares)
    .then((data) => res.sendStatus(201))
    .catch((err) => res.status(403).send(err));
});

//check if it is a new transaction - if no asset type, then it already exists
//if exists, post transaction
//if it doesn't exist, post the new ticker, then post the transaction
router.post("/transaction", (req, res) => {
  let { account } = req.query;
  if (req.body.doesExist) {
    let idType = "";
    req.body.asset === "Crypto"
      ? (idType = "crypto_id")
      : (idType = "traditional_id");
    getTickers(req.body)
      .then((data) => {
        insertTransaction(req.body, account, data[0][idType])
          .then((data) => res.status(200).send("posted"))
          .catch((err) => res.status(403).send(err));
      })
      .catch((err) => res.status(403).send(err));
  } else {
    insertTicker(req.body)
      .then((id) => {
        insertTransaction(req.body, account, id[0])
          .then((data) => res.status(200).send("posted"))
          .catch((err) => res.status(403).send(err));
      })
      .catch((err) => res.status(403).send(err));
  }
});

export default router;
