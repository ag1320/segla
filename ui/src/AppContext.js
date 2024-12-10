// Create AppContext.js
import * as React from "react";

import { useState, createContext } from "react";

export const AppContext = createContext(null);

function AppProvider({ children }) {
  const [url, setUrl] = useState('');
  //investments old - may be able to delete these
  const [selectedTicker, setSelectedTicker] = useState('');
  const [doesExist, setDoesExist] = useState(false)
  const [stockComposition, setStockComposition] = useState({})
  const [bondComposition, setBondComposition] = useState({})
  const [cryptoComposition, setCryptoComposition] = useState({})
  const [displayRow, setDisplayRow] = useState({})
  const [refresh, setRefresh] = useState(false)
  const [rows, setRows] = useState([]);
  const [portfolioValue, setPortfolioValue] = useState(0)

  //investments new
  const [vanguardRetirementTotal, setVanguardRetirementTotal] = useState(0)
  const [tspTotal, setTspTotal] = useState(0)
  const [vanguardBrokerageTotal, setVanguardBrokerageTotal] = useState(0)
  const [pa529Total, setPa529Total] = useState(0)
  const [cryptoData, setCryptoData] = useState([])
  const [cryptoTotal, setCryptoTotal] = useState(0)
  const [cryptoRefresh, setCryptoRefresh] = useState(false)
  const [cryptoMarketRefresh, setCryptoMarketRefresh] = useState(false)
  const [baskTotal, setBaskTotal] = useState(0)
  const [equityTotal, setEquityTotal] = useState(0)
  const [mortgageTotal, setMortgageTotal] = useState(0)
  const [studentLoanTotal, setStudentLoanTotal] = useState(0)
  const [autoLoanTotal, setAutoLoanTotal] = useState(0)



  //budget
  const [budgetData, setBudgetData] = useState({})
  const [newBudget, setNewBudget] = useState(false)
  const [fixedExpenses, setFixedExpenses] = useState([])
  const [fixedIncome, setFixedIncome] = useState([])
  const [date, setDate] = useState(null)
  const [monthlyIncome, setMonthlyIncome] = useState([])
  const [budgetRefresh, setBudgetRefresh] = useState(false)
  const [monthlyFixedExpenses, setMonthlyFixedExpenses] = useState([])
  const [openAddExpense, setOpenAddExpense] = useState(true)
  const [budgetCategories, setBudgetCategories] = useState([])
  const [monthlyVariedExpenses, setMonthlyVariedExpenses] = useState([])
  const [monthlyExpensesRefresh, setMonthlyExpensesRefresh] = useState(false);
  const [currentBudgetCategories, setCurrentBudgetCategories] = useState([]);
  const [displayBudgetCategories, setDisplayBudgetCategories] = useState([]);
  const [budgetComparison, setBudgetComparison] = useState([]);
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [monthEndDistributions, setMonthEndDistributions] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalFixedIncome, setTotalFixedIncome] = useState(0);
  const [totalFixedExpenses, setTotalFixedExpenses] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalDistributions, setTotalDistributions] = useState(0);
  const [totalMonthlyFixedExpenses, setTotalMonthlyFixedExpenses] = useState(0);
  const [openInstructions, setOpenInstructions] = useState(false);
  const [notes, setNotes] = useState([]);
  const [snackbarSuccess, setSnackbarSuccess] = useState(false);
  const [snackbarError, setSnackbarError] = useState(false);
  const [reason, setReason] = useState('Budget');
  const [error, setError] = useState(false);
  const [shares, setShares] = useState(null)
  const [reportData, setReportData] = useState([]);
  const [reportStartDate, setReportStartDate] = useState(null);
  const [reportEndDate, setReportEndDate] = useState(null);

  const valueObj = {
    url,
    setUrl,
    selectedTicker,
    setSelectedTicker,
    doesExist,
    setDoesExist,
    stockComposition,
    setStockComposition,
    bondComposition,
    setBondComposition,
    cryptoComposition,
    setCryptoComposition,
    refresh,
    setRefresh,
    portfolioValue,
    setPortfolioValue,
    budgetData,
    setBudgetData,
    newBudget,
    setNewBudget,
    fixedExpenses,
    setFixedExpenses,
    fixedIncome,
    setFixedIncome,
    date,
    setDate,
    monthlyIncome,
    setMonthlyIncome,
    budgetRefresh,
    setBudgetRefresh,
    monthlyFixedExpenses,
    setMonthlyFixedExpenses,
    openAddExpense,
    setOpenAddExpense,
    budgetCategories,
    setBudgetCategories,
    monthlyVariedExpenses,
    setMonthlyVariedExpenses,
    monthlyExpensesRefresh,
    setMonthlyExpensesRefresh,
    currentBudgetCategories,
    setCurrentBudgetCategories,
    displayBudgetCategories,
    setDisplayBudgetCategories,
    budgetComparison,
    setBudgetComparison,
    remainingBalance,
    setRemainingBalance,
    monthEndDistributions,
    setMonthEndDistributions,
    totalIncome,
    setTotalIncome,
    totalFixedExpenses,
    setTotalFixedExpenses,
    totalSpent,
    setTotalSpent,
    totalDistributions,
    setTotalDistributions,
    totalMonthlyFixedExpenses,
    setTotalMonthlyFixedExpenses,
    openInstructions,
    setOpenInstructions,
    notes,
    setNotes,
    snackbarSuccess,
    setSnackbarSuccess,
    snackbarError,
    setSnackbarError,
    reason,
    setReason,
    error,
    setError,
    totalFixedIncome,
    setTotalFixedIncome,
    shares,
    setShares,
    displayRow,
    setDisplayRow,
    rows,
    setRows,
    vanguardRetirementTotal,
    setVanguardRetirementTotal,
    tspTotal,
    setTspTotal,
    vanguardBrokerageTotal,
    setVanguardBrokerageTotal,
    pa529Total,
    setPa529Total,
    cryptoTotal,
    setCryptoTotal,
    baskTotal,
    setBaskTotal,
    equityTotal,
    setEquityTotal,
    mortgageTotal,
    setMortgageTotal,
    studentLoanTotal,
    setStudentLoanTotal,
    autoLoanTotal,
    setAutoLoanTotal,
    reportData,
    setReportData,
    reportStartDate,
    setReportStartDate,
    reportEndDate,
    setReportEndDate,
    cryptoData,
    setCryptoData,
    cryptoRefresh,
    setCryptoRefresh,
    cryptoMarketRefresh,
    setCryptoMarketRefresh
  }

  return (
    <div className="App-provider">
      <AppContext.Provider value={valueObj}>{children}</AppContext.Provider>
    </div>
  );
}

export default AppProvider;
