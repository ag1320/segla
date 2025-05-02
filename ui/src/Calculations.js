//hold duration (today - most recent purchase) days
function holdDuration(transactions) {
  let time = new Date();
  let today = time.getTime();
  let times = transactions.map((transaction) =>
    new Date(transaction.date).getTime()
  );
  let sorted = times.sort();
  let result = (today - sorted[0]) / 1000 / 60 / 60 / 24 / 365;
  return result;
}

//buy total (price*x+price*y...)$
function buyTotal(transactions) {
  let result = transactions.reduce((prev, current) => {
    if (current.order === "Buy") {
      return prev + current.price * current.shares;
    } else {
      return prev;
    }
  }, 0);
  return result;
}

//sell total (price*z+price*w...)$
function sellTotal(transactions) {
  let result = transactions.reduce((prev, current) => {
    if (current.order === "Sell") {
      return prev + current.price * current.shares;
    } else {
      return prev;
    }
  }, 0);
  return result;
}

//invested (buy total - sell total)$
function amountCurrentlyInvested(transactions) {
  let result = buyTotal(transactions) - sellTotal(transactions);
  return result;
}

//current avg invested per share (invested/current shares))$
function avgInvestedPerShare(amountInvested, shares) {
  let result = amountInvested / shares;
  return result;
}

//total current value (current shares * market price)$
function totalValue(shares, price) {
  let result = shares * price;
  return result;
}

//unrealized gains (total current value - invested)$
function unrealizedGains(value, amountInvested) {
  let result = value - amountInvested;
  return result;
}

//realized gains CALCULATE ONCE SHARES REACHES 0 (sell total - buy total)
function realizedGains(asset, transactions) {
  let result =
    asset.realizedGains + (sellTotal(transactions) - buyTotal(transactions));
  return result;
}



/************REPORT****************/

function getRandomRGB() {
  let randomNum1 = Math.floor(Math.random() * 156) + 100;
  let randomNum2 = Math.floor(Math.random() * 156) + 100;
  let randomNum3 = Math.floor(Math.random() * 156) + 100;

  if (randomNum1 > 220 && randomNum2 > 220 && randomNum3 > 220) {
    let min = Math.min(randomNum1, randomNum2, randomNum3);
    let diff = min - 220;
    randomNum1 -= diff;
    randomNum2 -= diff;
    randomNum3 -= diff;
  }

  return [randomNum1, randomNum2, randomNum3];
}

const generateReportLabels = (reportStartDate, reportEndDate) => {
  let labels = [];
  let currentDate = new Date(reportStartDate);

  while (currentDate <= reportEndDate) {
    labels.push([
      currentDate.toLocaleString("en-US", { month: "long" }),
      currentDate.getFullYear().toString(),
    ]);
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return labels;
};

const createReportDatasetObj = (label, data) => {
  const [r, g, b] = getRandomRGB();

  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, 0.5)`,
    borderColor: `rgba(${r}, ${g}, ${b}, 1)`,
    borderWidth: 1,
    data: data,
    label: label,
  };
}


function sortByMonthAndYear(array) {
  console.log("array", array);
  const monthsMap = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  };

  array.sort(function (a, b) {
    var monthA = monthsMap[a.month];
    var monthB = monthsMap[b.month];

    if (a.year !== b.year) {
      return a.year - b.year;
    } else {
      return monthA - monthB;
    }
  });

  return array;
}

function sumExpensesByMonthAndType(data, reportSelectedTypeCategories) {
  // sums amounts for each month and year by type (e.g., income, varied expense, fixed expense)
  const datasetObjs = [];
  reportSelectedTypeCategories.forEach((typeCategory) => {
    let filtered = [];
    if (typeCategory === "Total Fixed and Varied Expenses") {
      filtered = data.filter((item) => item.type === "varied expense" || item.type === "fixed expense");
    } else {
      let type = "";
      switch (typeCategory) {
        case "Varied Expenses":
          type = "varied expense";
          break;
        case "Fixed Expenses":
          type = "fixed expense";
          break;
        case "Income":
          type = "income";
          break;
        case "Month End Distributions":
          type = "month end distribution";
          break;
        default:
          type = "";
          break;
      }
      filtered = data.filter((item) => item.type === type);
    }

    const totalsMap = new Map();

    filtered.forEach(({ amount, month, year }) => {
      const monthNumber = new Date(`${month} 1, ${year}`).getMonth() + 1; // Convert month name to number
      const key = `${year}-${String(monthNumber).padStart(2, "0")}`; // e.g., "2025-01"
      if (!totalsMap.has(key)) {
      totalsMap.set(key, 0);
      }
      totalsMap.set(key, totalsMap.get(key) + amount);
    });

    console.log("totalsMap", totalsMap);

    // Ensure all months in the range have a value, even if it's 0
    const allMonths = new Set(
      data.map(({ month, year }) => {
      const monthNumber = new Date(`${month} 1, ${year}`).getMonth() + 1; // Convert month name to number
      return `${year}-${String(monthNumber).padStart(2, "0")}`;
      })
    );
    allMonths.forEach((key) => {
      if (!totalsMap.has(key)) {
      totalsMap.set(key, 0);
      }
    });

    const sortedKeys = Array.from(totalsMap.keys()).sort();
    const totals = sortedKeys.map((key) => totalsMap.get(key));
    const datasetObj = createReportDatasetObj(typeCategory, totals);
    datasetObjs.push(datasetObj);
  });
  return datasetObjs;
}

//sum the transactions by category by month and year
function sumExpensesByMonthAndCategory(data) {
  let simplifiedData = [];
  data.forEach((transaction) => {
    let entry = simplifiedData.find(
      (item) =>
        item.category === transaction.category &&
        item.subcategory === transaction.subcategory
    );
    if (entry) {
      let monthIndex = entry.sumOfTransactionsByMonth.findIndex(
        (item) =>
          item.month === transaction.month && item.year === transaction.year
      );
      if (monthIndex !== -1) {
        entry.sumOfTransactionsByMonth[monthIndex].amount +=
          transaction.amount;
      } else {
        entry.sumOfTransactionsByMonth.push({
          month: transaction.month,
          year: transaction.year,
          amount: transaction.amount,
        });
      }
    } else {
      simplifiedData.push({
        category: transaction.category,
        subcategory: transaction.subcategory,
        sumOfTransactionsByMonth: [
          {
            month: transaction.month,
            year: transaction.year,
            amount: transaction.amount,
          },
        ],
      });
    }
  });

  return simplifiedData;
}

const zeroOutEmptyMonths = (labels, simplifiedCategoryData) => {
    //insert 0s into months that dont have any spending in that category
    for (let i = 0; i < labels.length; i++) {
      const month = labels[i][0];
      const year = labels[i][1];
  
      simplifiedCategoryData.forEach((entry) => {
        if (
          entry.sumOfTransactionsByMonth[i]?.month !== month &&
          entry.sumOfTransactionsByMonth[i]?.year !== year
        ) {
          const obj = { month, year, amount: 0 };
          entry.sumOfTransactionsByMonth.splice(i, 0, obj);
        }
      });
    }
}

const getCategoryDatasets = (reportDataCategories, labels) => {
  let datasetObjs = [];
  let sortedReportDataCategories = sortByMonthAndYear(reportDataCategories);
  let simplifiedCategoryData = sumExpensesByMonthAndCategory(sortedReportDataCategories);

  //sort by month and year
  simplifiedCategoryData.forEach((entry) => {
    let sortedSumOfTransactionByMonth = sortByMonthAndYear(
      entry.sumOfTransactionsByMonth
    );
    entry.sumOfTransactionsByMonth = sortedSumOfTransactionByMonth;
  });

  zeroOutEmptyMonths(labels, simplifiedCategoryData);

  simplifiedCategoryData.forEach((entry) => {
    let category = "";
    let categoryData = entry.sumOfTransactionsByMonth.map((monthlySum) => {
      return monthlySum.amount;
    });

    entry.category === "Utilities"
      ? (category = entry.subcategory)
      : (category = entry.category);

    let datasetObj = createReportDatasetObj(
      category,
      categoryData
    );
    datasetObjs.push(datasetObj);
  });

  return datasetObjs;
}

const constructReportData = ( reportStartDate, reportEndDate, reportDataCategories, reportTotalData, reportSelectedTypeCategories) => {
  let labels = generateReportLabels(reportStartDate, reportEndDate);
  let categoryDatasets = getCategoryDatasets(reportDataCategories, labels);
  console.log("categoryDatasets", categoryDatasets);
  let typeDatasets = sumExpensesByMonthAndType(reportTotalData, reportSelectedTypeCategories);
  let datasets = [...categoryDatasets, ...typeDatasets];

  let data = {labels, datasets};
  return data
}

/************END REPORT****************/

export {
  holdDuration,
  buyTotal,
  sellTotal,
  amountCurrentlyInvested,
  avgInvestedPerShare,
  totalValue,
  unrealizedGains,
  realizedGains,
  constructReportData
};
