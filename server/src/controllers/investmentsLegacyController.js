import knex from "./dbConnection.js";

/*
**********************************************
              INVESTMENTS OLD
**********************************************
*/
function insertTransaction(body, owner, id) {
  let { date, price, shares, order, comment, asset } = body;
  if (asset === "Crypto") {
    return knex("transactions")
      .insert({
        date,
        price,
        shares,
        order,
        comment,
        owner,
        crypto_id: id,
      })
      .then((data) => data);
  } else {
    return knex("transactions")
      .insert({
        date,
        price,
        shares,
        order,
        comment,
        owner,
        traditional_id: id,
      })
      .then((data) => data);
  }
}

function getTickers(body) {
  let ticker = body.ticker;
  let table = "";
  body.asset === "Crypto" ? (table = "crypto") : (table = "traditional");
  return knex(table)
    .select("*")
    .where({ ticker })
    .then((data) => data);
}

function insertTicker(body) {
  let { ticker, shares, asset, detailedAsset, expenseRatio } = body;
  if (asset === "Crypto") {
    return knex("crypto")
      .insert({
        ticker,
        asset,
        totalShares: shares,
      })
      .returning("crypto_id")
      .then((data) => data);
  } else {
    return knex("traditional")
      .insert({
        ticker,
        totalShares: shares,
        asset,
        detailedAsset,
        expenseRatio,
      })
      .returning("traditional_id")
      .then((data) => data);
  }
}

function getTradTransactions(owner) {
  return knex("transactions")
    .join("traditional", {
      "transactions.traditional_id": "traditional.traditional_id",
    })
    .select("*")
    .where({ owner })
    .then((data) => data);
}

function getCryptoTransactions(owner) {
  return knex("transactions")
    .join("crypto", {
      "transactions.crypto_id": "crypto.crypto_id",
    })
    .select("*")
    .where({ owner })
    .then((data) => data);
}

function splitTickers(array) {
  let result = [];
  while (array.length) {
    result.push(array.splice(0, 10));
  }
  return result;
}

// NOTE: this stub returns undefined and has no live caller in the frontend.
// Preserved as-is from the original controllers.js during the restructure -
// not resurrected/fixed as part of this pass.
const fetchData = () => {
  return;
};

function updatePrice(symbol, regularMarketPrice, shortName, quoteType) {
  let ticker = symbol;
  if (quoteType === "CRYPTOCURRENCY") {
    return knex("crypto")
      .update({
        marketPrice: regularMarketPrice,
        name: shortName,
        detailedAsset: shortName,
      })
      .where({ ticker })
      .then((data) => data);
  } else {
    return knex("traditional")
      .update({ marketPrice: regularMarketPrice, name: shortName })
      .where({ ticker })
      .then((data) => data);
  }
}

function getShares(symbol, quoteType) {
  let ticker = symbol;
  if (quoteType === "CRYPTOCURRENCY") {
    return knex("crypto")
      .select("totalShares")
      .where({ ticker })
      .then((data) => data);
  } else {
    return knex("traditional")
      .select("totalShares", "expenseRatio")
      .where({ ticker })
      .then((data) => data);
  }
}

function deleteTransactions(id, asset, owner) {
  if (asset === "Crypto") {
    return knex("transactions")
      .del("*")
      .where({ crypto_id: id, owner })
      .then((data) => data);
  } else {
    return knex("transactions")
      .del("*")
      .where({ traditional_id: id, owner })
      .then((data) => data);
  }
}

function deleteTicker(id, asset) {
  if (asset === "Crypto") {
    return knex("crypto")
      .del("*")
      .where({ crypto_id: id })
      .then((data) => data);
  } else {
    return knex("traditional")
      .del("*")
      .where({ traditional_id: id })
      .then((data) => data);
  }
}

function patchShares(id, asset, shares) {
  if (asset === "Crypto") {
    return knex("crypto")
      .update({ totalShares: shares })
      .where({ crypto_id: id })
      .then((data) => data);
  } else {
    return knex("traditional")
      .update({ totalShares: shares })
      .where({ traditional_id: id })
      .then((data) => data);
  }
}

function findError(response, input) {
  let errorTickers = [];
  for (let ticker of input) {
    if (response.filter((e) => e.symbol === ticker).length === 0) {
      errorTickers.push(ticker);
    }
  }
  return errorTickers;
}

export {
  insertTransaction,
  getTickers,
  insertTicker,
  getTradTransactions,
  getCryptoTransactions,
  splitTickers,
  fetchData,
  updatePrice,
  getShares,
  deleteTransactions,
  deleteTicker,
  patchShares,
  findError,
};
