//hold duration (today - most recent purchase) days
function holdDuration(transactions) {
  let time = new Date();
  let today = time.getTime();
  let times = transactions.map((transaction) =>
    new Date(transaction.date).getTime(),
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
};

function sortByMonthAndYear(array) {
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
      filtered = data.filter(
        (item) =>
          item.type === "varied expense" || item.type === "fixed expense",
      );
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

    // Ensure all months in the range have a value, even if it's 0
    const allMonths = new Set(
      data.map(({ month, year }) => {
        const monthNumber = new Date(`${month} 1, ${year}`).getMonth() + 1; // Convert month name to number
        return `${year}-${String(monthNumber).padStart(2, "0")}`;
      }),
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
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  const categoryMap = new Map();

  data.forEach(
    ({ category, subcategory, month, year, amount, limit, warning }) => {
      const categoryKey = `${category}|||${subcategory}`;
      let entry = categoryMap.get(categoryKey);

      if (!entry) {
        entry = {
          category,
          subcategory,
          sumOfTransactionsByMonth: new Map(),
        };
        categoryMap.set(categoryKey, entry);
      }

      const monthYearKey = `${year}-${month}`;
      const currentAmount =
        entry.sumOfTransactionsByMonth.get(monthYearKey) || 0;
      entry.sumOfTransactionsByMonth.set(monthYearKey, currentAmount + amount);
    },
  );

  return Array.from(categoryMap.values()).map((entry) => {
    const sumOfTransactionsByMonth = Array.from(
      entry.sumOfTransactionsByMonth,
    ).map(([monthYear, amount]) => {
      const [year, month] = monthYear.split("-");
      return { month, year, amount };
    });

    return {
      category: entry.category,
      subcategory: entry.subcategory,
      sumOfTransactionsByMonth,
    };
  });
}

const zeroOutEmptyMonths = (labels, simplifiedCategoryData) => {
  // Rebuild each category's month series from the report labels to keep ordering stable.
  simplifiedCategoryData.forEach((entry) => {
    const monthYearToAmountMap = new Map(
      entry.sumOfTransactionsByMonth.map((item) => [
        `${item.year}-${item.month}`,
        item.amount,
      ]),
    );

    entry.sumOfTransactionsByMonth = labels.map(([month, year]) => ({
      month,
      year,
      amount: monthYearToAmountMap.get(`${year}-${month}`) || 0,
    }));
  });
};

const getCategoryDatasets = (reportDataCategories, labels) => {
  let datasetObjs = [];
  let sortedReportDataCategories = sortByMonthAndYear(reportDataCategories);

  let simplifiedCategoryData = sumExpensesByMonthAndCategory(
    sortedReportDataCategories,
  );

  //sort by month and year
  simplifiedCategoryData.forEach((entry) => {
    let sortedSumOfTransactionByMonth = sortByMonthAndYear(
      entry.sumOfTransactionsByMonth,
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

    let datasetObj = createReportDatasetObj(category, categoryData);

    datasetObjs.push(datasetObj);
  });

  return datasetObjs;
};

const getWarningsAndLimitsDatasets = (reportWarningsAndLimitsData, labels) => {
  if (
    !Array.isArray(reportWarningsAndLimitsData) ||
    reportWarningsAndLimitsData.length === 0
  ) {
    return [];
  }

  // Create a map of month/year to warning/limit values
  const monthYearToDataMap = new Map(
    reportWarningsAndLimitsData.map((entry) => [
      `${entry.year}-${entry.month}`,
      entry,
    ]),
  );

  // Align data with chart labels
  const warningData = labels.map(([month, year]) => {
    const entry = monthYearToDataMap.get(`${year}-${month}`);
    return entry?.warning ?? 0;
  });

  const limitData = labels.map(([month, year]) => {
    const entry = monthYearToDataMap.get(`${year}-${month}`);
    return entry?.limit ?? 0;
  });

  const warningDatasetObj = {
    label: "Warning",
    type: "line",
    borderColor: "rgb(164, 151, 0)",
    borderWidth: 2,
    fill: false,
    pointRadius: 0,
    tension: 0.4,
    data: warningData,
  };

  const limitDatasetObj = {
    label: "Limit",
    type: "line",
    borderColor: "rgba(255,0,0,1)",
    borderWidth: 2,
    fill: false,
    pointRadius: 0,
    tension: 0.4,
    data: limitData,
  };

  return [warningDatasetObj, limitDatasetObj];
};

const constructReportData = (
  reportStartDate,
  reportEndDate,
  reportDataCategories,
  reportTotalData,
  reportSelectedTypeCategories,
  reportWarningsAndLimitsData,
  reportSelectedCategories,
) => {
  let warningsAndLimitsDatasets = [];
  let labels = generateReportLabels(reportStartDate, reportEndDate);

  //Need to fix bug. Whenever you select the full date range for eating out, the page errors out
  let categoryDatasets = getCategoryDatasets(reportDataCategories, labels);
  let typeDatasets = sumExpensesByMonthAndType(
    reportTotalData,
    reportSelectedTypeCategories,
  );

  //if exactly 1 category is selected, then display the warnings and limits for that category on the graph as well
  if (reportSelectedCategories.length === 1) {
    warningsAndLimitsDatasets = getWarningsAndLimitsDatasets(
      reportWarningsAndLimitsData,
      labels,
    );
  }

  let datasets = [
    ...categoryDatasets,
    ...typeDatasets,
    ...warningsAndLimitsDatasets,
  ];
  let data = { labels, datasets };
  return data;
};

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
  constructReportData,
};
