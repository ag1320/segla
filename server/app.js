//npm install express pg knex morgan cors axios
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const _ = require("lodash");

const {
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
  checkBudget,
  getFixedExpenses,
  getFixedIncome,
  postIncome,
  postFixedExpense,
  editFixedExpenseAaron,
  editFixedExpenseJen,
  deleteFixedExpense,
  insertFixedExpense,
  editFixedIncome,
  deleteFixedIncome,
  insertFixedIncome,
  getMonthlyIncome,
  getMonthlyExpenses,
  deleteMonthlyExpenses,
  getCurrentBudgetCategories,
  getCategoryId,
  insertVariedExpense,
  getMonthlyVariedExpenses,
  deleteMonthlyVariedExpenses,
  postBudgetCategories,
  getBudgetCategories,
  deleteBudgetCategories,
  patchBudgetCategory,
  deleteBudgetCategory,
  postBudgetCategory,
  getMonthEndDistributions,
  postMonthEndDistribution,
  deleteMonthEndDistribution,
  deleteMonthlyIncome,
  postMonthlyIncome,
  exportCSV,
  postNote,
  getNotes,
  deleteNote,
  deleteNotes,
  deleteTransactions,
  deleteTicker,
  patchShares,
  getVanguardRetirement,
  postVanguardRetirement,
  deleteVanguardRetirement,
  patchVanguardRetirement,
  getTsp,
  postTsp,
  deleteTsp,
  patchTsp,
  getVanguardBrokerage,
  postVanguardBrokerage,
  deleteVanguardBrokerage,
  patchVanguardBrokerage,
  getPa529,
  postPa529,
  deletePa529,
  patchPa529,
  getCrypto,
  postCrypto,
  deleteCrypto,
  patchCrypto,
  getBask,
  postBask,
  deleteBask,
  patchBask,
  getLoans,
  postLoans,
  deleteLoans,
  patchLoans,
  getEquity,
  postEquity,
  deleteEquity,
  patchEquity,
  getReportData,
  getReportDataTotal,
  fetchCryptoMarketData
} = require("./controllers/controllers");

app.use(express.json());
app.use(morgan("dev"));
app.use(
  cors({
    origin: "*",
    methods: "GET, PUT, POST, PATCH, DELETE",
  })
);

// app.get("/aaron", (req, res) => {
// });

//get all transactions by owner join with traditional
//get all transactions by owner join with crypto
//stringify 10 tickers at a time
//loop through each array of 10
//loop through each ticker
//query yfapi
//update price in the db
//sanitize data


/*
**********************************************
              INVESTMENTS OLD
**********************************************
*/
app.get("/data", (req, res) => {
  let { account } = req.query;
  let result = {};
  let promises = [];
  let errorTickers = [];
  getTradTransactions(account).then((data) => {
    let transactionsFull = data;
    getCryptoTransactions(account).then((data) => {
      transactionsFull = transactionsFull.concat(data);
      let tickersFull = Array.from(
        new Set(transactionsFull.map((transaction) => transaction.ticker))
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
                  (el) => el.ticker === symbol
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

app.get("/ticker", (req, res) => {
  let { ticker } = req.query;
  fetchData(ticker).then((data) => {
    res.send(data?.data?.quoteResponse?.result?.[0]?.shortName);
  });
});

app.delete("/ticker", (req, res) => {
  let { id, asset, owner } = req.query;
  deleteTransactions(id, asset, owner)
    .then(() => {
      deleteTicker(id, asset);
    })
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.patch("/shares", (req, res) => {
  let { id, asset, shares } = req.body;
  patchShares(id, asset, shares)
    .then((data) => res.sendStatus(201))
    .catch((err) => res.status(403).send(err));
});

//check if it is a new transaction - if no asset type, then it already exists
//if exists, post transaction
//if it doesn't exist, post the new ticker, then post the transaction
app.post("/transaction", (req, res) => {
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

// app.post("/jen", (req, res) => {
//   if (req.body.asset === "") {
//     getTradTickers(req.body)
//       .then((data) => {
//         insertTradTransaction(req.body, "Jen", data[0].traditional_id)
//           .then((data) => res.status(200).send("posted"))
//           .catch((err) => res.status(403).send(err));
//       })
//       .catch((err) => res.status(403).send(err));
//   } else {
//     insertTradTicker(req.body)
//       .then((id) => {
//         insertTradTransaction(req.body, "Jen", id[0])
//           .then((data) => res.status(200).send("posted"))
//           .catch((err) => res.status(403).send(err));
//       })
//       .catch((err) => res.status(403).send(err));
//   }
// });

/*
**********************************************
              INVESTMENTS NEW
**********************************************
*/

app.get("/vanguardRetirement", (req, res) => {
  getVanguardRetirement()
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.post("/vanguardRetirement", (req, res) => {
  let { accountHolder, accountType, value } = req.body;
  postVanguardRetirement(accountHolder, accountType, value)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.delete("/vanguardRetirement", (req, res) => {
  let { id } = req.query;
  deleteVanguardRetirement(id)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.patch("/vanguardRetirement", (req, res) => {
  let {
    accountHolder,
    accountType,
    value,
    totalReturn,
    totalReturnPercentage,
    ytdReturnPercentage,
    id,
  } = req.body;
  patchVanguardRetirement(
    accountHolder,
    accountType,
    value,
    totalReturn,
    totalReturnPercentage,
    ytdReturnPercentage,
    id
  )
    .then((data) => res.sendStatus(201))
    .catch((err) => {
      res.status(403).send(err);
    });
});

app.get("/tsp", (req, res) => {
  getTsp()
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.post("/tsp", (req, res) => {
  let {
    accountHolder,
    accountType,
    value,
    totalReturn,
    contribution,
    govtContribution,
    ytdReturnPercentage,
  } = req.body;
  postTsp(
    accountHolder,
    accountType,
    value,
    totalReturn,
    contribution,
    govtContribution,
    ytdReturnPercentage
  )
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.delete("/tsp", (req, res) => {
  let { id } = req.query;
  deleteTsp(id)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.patch("/tsp", (req, res) => {
  let {
    accountHolder,
    accountType,
    value,
    totalReturn,
    contribution,
    govtContribution,
    ytdReturnPercentage,
    id,
  } = req.body;
  console.log(
    "payload",
    accountHolder,
    accountType,
    value,
    totalReturn,
    contribution,
    govtContribution,
    ytdReturnPercentage,
    id
  );
  patchTsp(
    accountHolder,
    accountType,
    value,
    totalReturn,
    contribution,
    govtContribution,
    ytdReturnPercentage,
    id
  )
    .then((data) => res.sendStatus(201))
    .catch((err) => {
      res.status(403).send(err);
    });
});

app.get("/vanguardBrokerage", (req, res) => {
  getVanguardBrokerage()
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.post("/vanguardBrokerage", (req, res) => {
  let { accountHolder, accountType, value } = req.body;
  postVanguardBrokerage(accountHolder, accountType, value)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.delete("/vanguardBrokerage", (req, res) => {
  let { id } = req.query;
  deleteVanguardBrokerage(id)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.patch("/vanguardBrokerage", (req, res) => {
  let {
    accountHolder,
    accountType,
    value,
    totalReturn,
    totalReturnPercentage,
    ytdReturnPercentage,
    id,
  } = req.body;
  patchVanguardBrokerage(
    accountHolder,
    accountType,
    value,
    totalReturn,
    totalReturnPercentage,
    ytdReturnPercentage,
    id
  )
    .then((data) => res.sendStatus(201))
    .catch((err) => {
      res.status(403).send(err);
    });
});

app.get("/pa529", (req, res) => {
  getPa529()
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.post("/pa529", (req, res) => {
  let { beneficiary, value, totalReturn, year } = req.body;
  postPa529(beneficiary, value, totalReturn, year)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.delete("/pa529", (req, res) => {
  let { id } = req.query;
  deletePa529(id)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.patch("/pa529", (req, res) => {
  let { beneficiary, value, totalReturn, year, id } = req.body;
  patchPa529(beneficiary, value, totalReturn, year, id)
    .then((data) => res.sendStatus(201))
    .catch((err) => {
      res.status(403).send(err);
    });
});

app.get("/crypto", (req, res) => {
  getCrypto()
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.post("/crypto", (req, res) => {
  let { ticker, name, url, shares, totalSpent } = req.body;
  postCrypto(ticker, name, url, shares, totalSpent)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.delete("/crypto", (req, res) => {
  let { id } = req.query;
  deleteCrypto(id)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.patch("/crypto", (req, res) => {
  let { ticker, name, url, shares, totalSpent, id } = req.body;
  patchCrypto(ticker, name, url, shares, totalSpent, id)
    .then((data) => res.sendStatus(201))
    .catch((err) => {
      res.status(403).send(err);
    });
});

app.get("/bask", (req, res) => {
  getBask()
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.post("/bask", (req, res) => {
  let { interestRate, value, totalReturn, ytdReturn } = req.body;
  postBask(interestRate, value, totalReturn, ytdReturn)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.delete("/bask", (req, res) => {
  let { id } = req.query;
  deleteBask(id)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.patch("/bask", (req, res) => {
  let { interestRate, value, totalReturn, ytdReturn, id } = req.body;
  patchBask(interestRate, value, totalReturn, ytdReturn, id)
    .then((data) => res.sendStatus(201))
    .catch((err) => {
      res.status(403).send(err);
    });
});

app.get("/loans", (req, res) => {
  getLoans()
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.post("/loans", (req, res) => {
  let {
    url,
    holder,
    interestRate,
    payoffDate,
    monthlyPayment,
    remainingBalance,
    type,
  } = req.body;
  postLoans(
    url,
    holder,
    interestRate,
    payoffDate,
    monthlyPayment,
    remainingBalance,
    type
  )
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.delete("/loans", (req, res) => {
  let { id } = req.query;
  deleteLoans(id)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.patch("/loans", (req, res) => {
  let { url, holder, interestRate, payoffDate, monthlyPayment, remainingBalance, id } = req.body;
  patchLoans(url, holder, interestRate, payoffDate, monthlyPayment, remainingBalance, id)
    .then((data) => res.sendStatus(201))
    .catch((err) => {
      res.status(403).send(err);
    });
});

app.get("/equity", (req, res) => {
  getEquity()
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.post("/equity", (req, res) => {
  let {
    address, valuation, remainingBalance
  } = req.body;
  postEquity(
    address, valuation, remainingBalance
  )
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.delete("/equity", (req, res) => {
  let { id } = req.query;
  deleteEquity(id)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.patch("/equity", (req, res) => {
  let { address, valuation, remainingBalance, id } = req.body;
  patchEquity(address, valuation, remainingBalance, id)
    .then((data) => res.sendStatus(201))
    .catch((err) => {
      res.status(403).send(err);
    });
});

app.get("/crypto-market", (req, res) => {
  let { idTags } = req.query
  fetchCryptoMarketData(idTags)
    .then((data) => res.status(200).send(data.data))
    .catch((err) => res.status(403).send(err));
});

/*
**********************************************
                   BUDGET
**********************************************
*/

app.post("/budget/check", (req, res) => {
  let { month, year } = req.body;
  checkBudget(month, year)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.get("/fixedExpenses", (req, res) => {
  getFixedExpenses()
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.get("/fixedIncome", (req, res) => {
  getFixedIncome()
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.post("/budget", (req, res) => {
  let promisesIncome = [];
  let promisesExpense = [];
  let promisesBudgetCategories = [];
  let { fixedExpenses, fixedIncome, month, year, currentBudgetCategories } =
    req.body;
  for (let item of fixedIncome) {
    let promiseIncome = postIncome(item, month, year);
    promisesIncome.push(promiseIncome);
  }
  Promise.all(promisesIncome).then(() => {
    for (let expense of fixedExpenses) {
      let promiseExpense = postFixedExpense(expense, month, year);
      promisesExpense.push(promiseExpense);
    }
    Promise.all(promisesExpense).then(() => {
      for (let category of currentBudgetCategories) {
        let promiseCategory = postBudgetCategories(category, month, year);
        promisesBudgetCategories.push(promiseCategory);
      }
      Promise.all(promisesBudgetCategories)
        .then((data) => res.status(201).send(data))
        .catch((err) => res.status(403).send(err));
    });
  });
});

app.delete("/budget", (req, res) => {
  let { month, year } = req.query;
  let budgetPromises = [];
  let expensesPromise = deleteMonthlyExpenses(month, year);
  let categoriesPromise = deleteBudgetCategories(month, year);
  let notesPromise = deleteNotes(month, year);
  budgetPromises.push(expensesPromise, categoriesPromise, notesPromise);
  Promise.all(budgetPromises)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.patch("/fixedExpenses", (req, res) => {
  let { category, aaron, oldCategory, jen } = req.body;
  editFixedExpenseAaron(category, oldCategory, aaron)
    .then((data) => {
      editFixedExpenseJen(category, oldCategory, jen);
    })
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.delete("/fixedExpenses", (req, res) => {
  let { category } = req.query;
  deleteFixedExpense(category)
    .then((data) => res.sendStatus(202))
    .catch((err) => res.status(403).send(err));
});

app.post("/fixedExpenses", (req, res) => {
  let { category, aaron, jen } = req.body;
  insertFixedExpense(category, aaron, jen)
    .then((data) => res.sendStatus(202))
    .catch((err) => res.status(403).send(err));
});

app.patch("/fixedIncome", (req, res) => {
  let { source, amount, id } = req.body;
  editFixedIncome(source, id, amount)
    .then((data) => res.sendStatus(201))
    .catch((err) => {
      console.log(err);
      res.status(403).send(err);
    });
});

app.delete("/fixedIncome", (req, res) => {
  let { source } = req.query;
  deleteFixedIncome(source)
    .then((data) => res.sendStatus(202))
    .catch((err) => res.status(403).send(err));
});

app.post("/fixedIncome", (req, res) => {
  let { source, amount } = req.body;
  insertFixedIncome(source, amount)
    .then((data) => res.sendStatus(202))
    .catch((err) => res.status(403).send(err));
});

app.get("/monthlyIncome", (req, res) => {
  let { month, year } = req.query;
  getMonthlyIncome(month, year)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.post("/monthlyIncome", (req, res) => {
  let { category, amount, month, year } = req.body;
  postMonthlyIncome(category, amount, month, year)
    .then((data) => res.sendStatus(202))
    .catch((err) => res.status(403).send(err));
});

app.delete("/monthlyIncome", (req, res) => {
  let { id } = req.query;
  deleteMonthlyIncome(id)
    .then((data) => res.sendStatus(202))
    .catch((err) => res.status(403).send(err));
});

app.get("/monthlyExpenses", (req, res) => {
  let { month, year, type } = req.query;
  getMonthlyExpenses(month, year, type)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.post("/monthlyExpenses", (req, res) => {
  let { category, subcategory, amount, month, year } = req.body;
  getCategoryId(category, subcategory, month, year)
    .then((id) => {
      insertVariedExpense(id, amount, month, year)
        .then((data) => res.sendStatus(202))
        .catch((err) => res.status(403).send(err));
    })
    .catch((err) => res.status(403).send(err));
});

app.get("/monthlyVariedExpenses", (req, res) => {
  let { month, year, type } = req.query;
  getMonthlyVariedExpenses(month, year, type)
    .then((data) => res.status(200).send(data))
    .catch((err) => {
      console.log(err);
      res.status(403).send(err);
    });
});

app.delete("/monthlyVariedExpenses", (req, res) => {
  let { id } = req.query;
  deleteMonthlyVariedExpenses(id)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.get("/currentBudgetCategories", (req, res) => {
  getCurrentBudgetCategories()
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.get("/budgetCategories", (req, res) => {
  let { month, year } = req.query;
  getBudgetCategories(month, year)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.patch("/budgetCategories", (req, res) => {
  let { budgetRange } = req.body;
  let promisesRange = [];
  for (let budget of budgetRange) {
    let promiseRange = patchBudgetCategory(budget);
    promisesRange.push(promiseRange);
  }
  Promise.all(promisesRange)
    .then((data) => res.sendStatus(201))
    .catch((err) => res.status(403).send(err));
});

app.delete("/budgetCategories", (req, res) => {
  let { id } = req.query;
  deleteBudgetCategory(id)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.post("/budgetCategories", (req, res) => {
  let { category, range } = req.body;
  postBudgetCategory(category, range)
    .then((data) => res.sendStatus(202))
    .catch((err) => res.status(403).send(err));
});

app.get("/monthEndDistributions", (req, res) => {
  let { month, year } = req.query;
  getMonthEndDistributions(month, year)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.post("/monthEndDistributions", (req, res) => {
  let { category, amount, month, year } = req.body;
  postMonthEndDistribution(category, amount, month, year)
    .then((data) => res.sendStatus(202))
    .catch((err) => res.status(403).send(err));
});

app.delete("/monthEndDistributions", (req, res) => {
  let { id } = req.query;
  deleteMonthEndDistribution(id)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.get("/exportCSV", (req, res) => {
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
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.post("/notes", (req, res) => {
  let { title, details, month, year } = req.body;
  postNote(title, details, month, year)
    .then((data) => res.sendStatus(202))
    .catch((err) => res.status(403).send(err));
});

app.get("/notes", (req, res) => {
  let { month, year } = req.query;
  getNotes(month, year)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.delete("/notes", (req, res) => {
  let { id } = req.query;
  deleteNote(id)
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(403).send(err));
});

app.get("/reportData", (req, res) => {
  let { startDateString, endDateString, formattedCategories, reason } = req.query;
  if (reason === "total") {
    getReportDataTotal(startDateString, endDateString)
      .then((data) => res.status(200).send(data))
      .catch((err) => res.status(403).send(err));
  } else {
    getReportData(startDateString, endDateString, formattedCategories)
      .then((data) => res.status(200).send(data))
      .catch((err) => res.status(403).send(err));
  }
});


const port = 3001;
app.listen(port, () =>
  console.log(`Backend listening at http://localhost:${port}`)
);
