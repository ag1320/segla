import knex from "./dbConnection.js";
import axios from "axios";

function getCrypto() {
  return knex("cryptocurrency")
    .select("*")
    .then((data) => data);
}

function postCrypto(ticker, name, url, shares, total_spent) {
  return knex("cryptocurrency")
    .insert({
      ticker,
      name,
      url,
      shares,
      total_spent,
    })
    .then((data) => data);
}

function deleteCrypto(crypto_id) {
  return knex("cryptocurrency")
    .del("*")
    .where({ crypto_id })
    .then((data) => data);
}

function patchCrypto(ticker, name, url, shares, total_spent, crypto_id) {
  return knex("cryptocurrency")
    .update({
      ticker,
      name,
      url,
      shares,
      total_spent,
    })
    .where({ crypto_id })
    .then((data) => data);
}

function fetchCryptoMarketData(idTags) {
  let url = "https://api.coingecko.com/api/v3/simple/price?";
  url = url + "ids=" + idTags;
  url = url + "&vs_currencies=usd";
  let apiKey = process.env.COIN_GECKO_API_KEY;
  console.log("url", url);
  let options = {
    method: "GET",
    url,
    headers: {
      "x-cg-demo-api-key": apiKey,
    },
  };

  return axios
    .request(options)
    .then((data) => data)
    .catch((err) => err);
}

export {
  getCrypto,
  postCrypto,
  deleteCrypto,
  patchCrypto,
  fetchCryptoMarketData,
};
