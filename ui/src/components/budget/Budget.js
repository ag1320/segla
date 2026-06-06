import { Grid, Button, Box, Typography, Divider, Tooltip, Paper } from "@mui/material";
import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../AppContext.js";
import axios from "axios";
import TabBar from "./BudgetTabBar.js";
import RemainingBalance from "./RemainingBalance.js";
import ConfrimIncomeDialog from "./ConfirmIncomeDialog.js";
import ConfirmFixedDialog from "./ConfirmFixedDialog.js";
import InstructionsDialog from "./InstructionsDialog.js";
import ConfirmExportDialog from "./ConfirmExportDialog.js";
import GenerateReportModal from "./GenerateReportModal.js";
import ReportModal from "./ReportModal.js";
import Donut from "../Donut.js";
import FixedIncome from "./FixedIncome.js";
import FixedExpenses from "./FixedExpenses.js";
import { postBudgetSeed } from "./BudgetFunctions";
import DeleteIcon from "@mui/icons-material/Delete";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import RemoveIcon from "@mui/icons-material/Remove";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import ConfirmDeleteBudgetDialog from "./ConfirmDeleteBudgetDialog.js";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import BudgetCategories from "./BudgetCategories.js";
import "./Budget.css";

export default function Budget() {
  //fixedMonthlyExpenses is are fixed expenses for that individual month
  //these are displayed on the budget tab bar item fixed monthly expenses
  //In contrast, fixedExpenses are the master fixed expenses

  let { setDate, date } = useContext(AppContext);
  let { setTotalSpent } = useContext(AppContext);
  let { setTotalIncome } = useContext(AppContext);
  let { notes, setNotes } = useContext(AppContext);
  let { reason, setReason } = useContext(AppContext);
  let { remainingBalance, setRemainingBalance } = useContext(AppContext);
  let { setTotalFixedIncome } = useContext(AppContext);
  let { setTotalDistributions } = useContext(AppContext);
  let { setTotalFixedExpenses } = useContext(AppContext);
  let { monthlyExpensesRefresh } = useContext(AppContext);
  let { newBudget, setNewBudget } = useContext(AppContext);
  let { fixedIncome, setFixedIncome } = useContext(AppContext);
  let { setTotalMonthlyFixedExpenses } = useContext(AppContext);
  let { monthlyIncome, setMonthlyIncome } = useContext(AppContext);
  let { fixedExpenses, setFixedExpenses } = useContext(AppContext);
  let { budgetRefresh, setBudgetRefresh } = useContext(AppContext);
  let { setSnackbarSuccess, setSnackbarError } = useContext(AppContext);
  let { budgetCategories, setBudgetCategories } = useContext(AppContext);
  let { budgetComparison, setBudgetComparison } = useContext(AppContext);
  let { monthEndDistributions, setMonthEndDistributions } =
    useContext(AppContext);
  let { monthlyFixedExpenses, setMonthlyFixedExpenses } =
    useContext(AppContext);
  let { monthlyVariedExpenses, setMonthlyVariedExpenses } =
    useContext(AppContext);
  let { currentBudgetCategories, setCurrentBudgetCategories } =
    useContext(AppContext);
  let { displayBudgetCategories, setDisplayBudgetCategories } =
    useContext(AppContext);

  const [confirmFixed, setConfirmFixed] = useState(false);
  const [confirmDeleteBudget, setConfirmDeleteBudget] = useState(false);
  const [viewExpenses, setViewExpenses] = useState(false);
  const [viewIncome, setViewIncome] = useState(false);
  const [viewCategories, setViewCategories] = useState(false);
  const [viewGenerateReport, setViewGenerateReport] = useState(false);
  const [viewReport, setViewReport] = useState(false);
  const [balance, setBalance] = useState(0);
  const [openConfirmExport, setOpenConfirmExport] = useState(false);

  const emptyComposition = {
    remaining: 1,
  };

  const handleFixedConfirm = () => {
    let month = date.toLocaleString("EN-US", { month: "long" });
    let year = date.getFullYear();
    postBudgetSeed(
      fixedExpenses,
      fixedIncome,
      month,
      year,
      currentBudgetCategories
    ).then(() => {
      setReason("Budget");
      setBudgetRefresh(!budgetRefresh);
    });
  };

  async function deleteBudget() {
    let month = date?.toLocaleString("EN-US", { month: "long" });
    let year = date?.getFullYear();
    let payload = {
      params: {
        month,
        year,
      },
    };
    try {
      let res = await axios.delete(`http://localhost:3001/budget`, payload);
      setSnackbarSuccess(true);
      return res.data;
    } catch (err) {
      setSnackbarError(true);
    }
  }

  async function exportCSV(isExported) {
    let month = date?.toLocaleString("EN-US", { month: "long" });
    let year = date?.getFullYear();
    let payload = {
      params: {
        month,
        year,
        isExported,
      },
    };
    try {
      let res = await axios.get(`http://localhost:3001/exportCSV`, payload);
      setSnackbarSuccess(true);
      return res.data;
    } catch (err) {
      setSnackbarError(true);
    }
  }

  useEffect(() => {
    async function getBudgetCategories() {
      let month = date?.toLocaleString("EN-US", { month: "long" });
      let year = date?.getFullYear();
      let payload = {
        params: {
          month,
          year,
        },
      };
      let res = await axios.get(
        `http://localhost:3001/budgetCategories`,
        payload
      );
      return res.data;
    }

    async function getMonthEndDistributions() {
      let month = date?.toLocaleString("EN-US", { month: "long" });
      let year = date?.getFullYear();
      let payload = {
        month,
        year,
      };
      let res = await axios.get(`http://localhost:3001/monthEndDistributions`, {
        params: payload,
      });
      return res.data;
    }

    async function getFixedIncome() {
      let res = await axios.get(`http://localhost:3001/fixedIncome`);
      return res.data;
    }

    async function getFixedExpenses() {
      let res = await axios.get(`http://localhost:3001/fixedExpenses`);
      return res.data;
    }

    async function getNotes() {
      let month = date?.toLocaleString("EN-US", { month: "long" });
      let year = date?.getFullYear();
      let payload = {
        month,
        year,
      };
      let res = await axios.get(`http://localhost:3001/notes`, {
        params: payload,
      });
      return res.data;
    }

    async function getCurrentBudgetCategories() {
      let res = await axios.get(
        `http://localhost:3001/currentBudgetCategories`
      );
      return res.data;
    }

    async function getMonthlyIncome() {
      let month = date?.toLocaleString("EN-US", { month: "long" });
      let year = date?.getFullYear();
      let payload = {
        month,
        year,
      };
      let res = await axios.get(`http://localhost:3001/monthlyIncome`, {
        params: payload,
      });
      return res.data;
    }

    async function getMonthlyFixedExpenses() {
      let month = date?.toLocaleString("EN-US", { month: "long" });
      let year = date?.getFullYear();
      let payload = {
        month,
        year,
        type: "fixed expense",
      };
      let res = await axios.get(`http://localhost:3001/monthlyExpenses`, {
        params: payload,
      });
      return res.data;
    }

    async function getMonthlyVariableExpenses() {
      let month = date?.toLocaleString("EN-US", { month: "long" });
      let year = date?.getFullYear();
      let payload = {
        month,
        year,
        type: "varied expense",
      };
      let res = await axios.get(`http://localhost:3001/monthlyVariedExpenses`, {
        params: payload,
      });
      return res.data;
    }
    let mounted = true;
    if (mounted) {
      if (!date) {
        setMonthlyFixedExpenses([]);
        setMonthlyIncome([]);
        setMonthlyVariedExpenses([]);
        setBudgetCategories([]);
        setMonthEndDistributions([]);
        setNotes([]);
        if (reason === "Budget" || reason === "fixedExpense") {
          getFixedExpenses().then((items) => {
            setFixedExpenses(items);
          });
        }
        if (reason === "Budget" || reason === "fixedIncome") {
          getFixedIncome().then((items) => {
            setFixedIncome(items);
          });
        }
        if (reason === "Budget" || reason === "budgetCategory") {
          getCurrentBudgetCategories().then((items) => {
            setCurrentBudgetCategories(items);
          });
        }
      } else {
        if (reason === "Budget" || reason === "fixedExpense") {
          getMonthlyFixedExpenses().then((items) => {
            setMonthlyFixedExpenses(items);
          });
          getFixedExpenses().then((items) => {
            setFixedExpenses(items);
          });
        }
        if (reason === "Budget" || reason === "monthlyIncome") {
          getMonthlyIncome().then((items) => {
            setMonthlyIncome(items);
          });
        }
        if (reason === "Budget" || reason === "monthlyVaried") {
          getMonthlyVariableExpenses().then((items) => {
            setMonthlyVariedExpenses(items);
          });
        }
        if (reason === "Budget" || reason === "budgetCategory") {
          getBudgetCategories().then((items) => {
            setBudgetCategories(items);
          });
          getCurrentBudgetCategories().then((items) => {
            setCurrentBudgetCategories(items);
          });
        }
        if (reason === "Budget" || reason === "note") {
          getNotes().then((items) => {
            setNotes(items);
          });
        }
        if (reason === "Budget" || reason === "fixedIncome") {
          getFixedIncome().then((items) => {
            setFixedIncome(items);
          });
        }
        if (reason === "Budget" || reason === "distribution") {
          getMonthEndDistributions().then((items) => {
            setMonthEndDistributions(items);
          });
        }
      }
    }
    return () => (mounted = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, budgetRefresh]);

  useEffect(() => {
    const filterBudgetCategories = (budgetCategories) => {
      let filteredBudgetCategories = budgetCategories.map((category) => {
        return category.category;
      });
      let filteredCategoriesSet = new Set(filteredBudgetCategories);
      let filteredCategories = Array.from(filteredCategoriesSet);
      setDisplayBudgetCategories(filteredCategories);
    };

    let mounted = true;
    if (mounted) {
      filterBudgetCategories(budgetCategories);
    }
    return () => (mounted = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budgetCategories]);

  useEffect(() => {
    const getBalance = () => {
      let spendTotal = monthlyVariedExpenses
        .reduce((previousAmount, currentExpense) => {
          return previousAmount + currentExpense.amount;
        }, 0)
        .toFixed(2);

      let incomeTotal = monthlyIncome
        .reduce((previousAmount, currentIncome) => {
          return previousAmount + currentIncome.amount;
        }, 0)
        .toFixed(2);

      let fixedIncomeTotal = fixedIncome
        .reduce((previousAmount, currentIncome) => {
          return previousAmount + currentIncome.amount;
        }, 0)
        .toFixed(2);

      let monthEndDistributionsTotal = monthEndDistributions
        .reduce((previousAmount, currentDistribution) => {
          return previousAmount + currentDistribution.amount;
        }, 0)
        .toFixed(2);

      let fixedExpensesTotal = parseFloat(
        fixedExpenses
          .reduce((previousAmount, currentExpense) => {
            return previousAmount + currentExpense.amount;
          }, 0)
          .toFixed(2)
      );

      let monthlyFixedExpensesTotal = monthlyFixedExpenses
        .reduce((previousAmount, currentExpense) => {
          return previousAmount + currentExpense.amount;
        }, 0)
        .toFixed(2);

      let remaining = (
        incomeTotal -
        monthlyFixedExpensesTotal -
        spendTotal -
        monthEndDistributionsTotal
      ).toFixed(2);
      let remainingDonut = remaining;
      if (remainingDonut < 0) {
        remainingDonut = 0;
      }

      let budgetSummary = {
        variable: spendTotal,
        fixed: monthlyFixedExpensesTotal,
        distributions: monthEndDistributionsTotal,
        remaining: remainingDonut,
      };

      setTotalFixedIncome(parseFloat(fixedIncomeTotal));
      setTotalIncome(parseFloat(incomeTotal));
      setTotalSpent(parseFloat(spendTotal));
      setTotalMonthlyFixedExpenses(parseFloat(monthlyFixedExpensesTotal));
      setTotalFixedExpenses(parseFloat(fixedExpensesTotal));
      setRemainingBalance(parseFloat(remaining));
      setTotalDistributions(parseFloat(monthEndDistributionsTotal));
      setBalance(budgetSummary);
    };

    let mounted = true;
    if (mounted) {
      getBalance();
    }
    return () => (mounted = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    monthlyVariedExpenses,
    budgetComparison,
    budgetRefresh,
    date,
    budgetCategories,
    fixedIncome,
    monthlyExpensesRefresh,
    displayBudgetCategories,
    monthEndDistributions,
    monthlyIncome,
    fixedExpenses,
  ]);

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      let budgetCompare = displayBudgetCategories.map((category) => {
        let obj = {};
        obj.category = category;
        obj.subtotal = monthlyVariedExpenses.reduce(
          (prevAmount, currentExpense) => {
            if (currentExpense.category === category) {
              return currentExpense.amount + prevAmount;
            } else {
              return prevAmount;
            }
          },
          0
        );
        for (let cat of budgetCategories) {
          obj.warning = false;
          obj.limit = false;
          if (obj.category === cat.category) {
            obj.warningAmount = cat.warning;
            obj.limitAmount = cat.limit;
            if (obj.subtotal > cat.warning) {
              obj.warning = true;
              if (obj.subtotal > cat.limit) {
                obj.limit = true;
                break;
              }
              break;
            }
          }
        }
        return obj;
      });
      setBudgetComparison(budgetCompare);
    }
    return () => (mounted = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    monthlyExpensesRefresh,
    monthlyVariedExpenses,
    budgetCategories,
    displayBudgetCategories,
    budgetRefresh,
  ]);

  const handleDeleteConfirm = () => {
    deleteBudget().then(() => {
      setReason("budget");
      setBudgetRefresh(!budgetRefresh);
      setDate(null);
    });
  };

  const handleDelete = () => {
    setConfirmDeleteBudget(true);
  };

  const handleExportCSV = (isExported) => {
    exportCSV(isExported).then(() => {
      setReason("note");
      setBudgetRefresh(!budgetRefresh);
    });
  };

  const handleExportCSVClick = () => {
    if (notes.filter((e) => e.title === "Exported").length > 0) {
      setOpenConfirmExport(true);
    } else {
      handleExportCSV(false);
    }
  };

  const handleViewCategories = () => setViewCategories(true);
  const handleIncomeConfirm = () => setConfirmFixed(true);
  const handleViewExpenses = () => setViewExpenses(true);
  const handleViewIncome = () => setViewIncome(true);
  const handleGenerateReport = () => setViewGenerateReport(true);

  return (
    <>
      <InstructionsDialog />
      <ConfirmExportDialog
        open={openConfirmExport}
        setOpen={setOpenConfirmExport}
        onConfirm={handleExportCSV}
      />
      <ConfrimIncomeDialog
        open={newBudget}
        setOpen={setNewBudget}
        income={fixedIncome}
        onConfirm={handleIncomeConfirm}
      />
      <ConfirmFixedDialog
        open={confirmFixed}
        setOpen={setConfirmFixed}
        fixedExpenses={fixedExpenses}
        onConfirm={handleFixedConfirm}
      />
      <ConfirmDeleteBudgetDialog
        open={confirmDeleteBudget}
        setOpen={setConfirmDeleteBudget}
        onConfirm={handleDeleteConfirm}
        date={date}
      />
      <GenerateReportModal
        open={viewGenerateReport}
        setOpen={setViewGenerateReport}
        setViewReport={setViewReport}
      />
      <ReportModal
        open={viewReport}
        setOpen={setViewReport}
        setOpenGenerateReport={setViewGenerateReport}
      />
      <Grid container style={{ height: "100%" }}>
        {!viewExpenses && !viewIncome && !viewCategories ? (
          <>
            {/* Unified header panel */}
            <Grid item xs={12} sx={{ px: 3, pt: 3, pb: 2 }}>
              <Paper
                elevation={0}
                sx={{
                  background: "linear-gradient(135deg, #1e3347 0%, #243447 100%)",
                  borderRadius: 2,
                  p: 3,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                }}
              >
                {/* Top row: date picker, remaining balance, donut */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, mb: 2.5 }}>
                  <RemainingBalance />

                  {date && (
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="caption"
                        sx={{ color: "rgba(255,255,255,0.45)", display: "block", mb: 0.5, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.65rem" }}
                      >
                        Remaining Balance
                      </Typography>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 700,
                          lineHeight: 1,
                          color: remainingBalance >= 0 ? "#66bb6a" : "#ef5350",
                        }}
                      >
                        ${Math.abs(parseFloat(remainingBalance)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                      {remainingBalance < 0 && (
                        <Typography variant="caption" sx={{ color: "#ef5350" }}>over budget</Typography>
                      )}
                    </Box>
                  )}

                  <Box sx={{ width: 240, flexShrink: 0 }}>
                    {date ? (
                      <Donut composition={balance} title="Budget" />
                    ) : (
                      <Donut composition={emptyComposition} title="" />
                    )}
                  </Box>
                </Box>

                {/* Divider */}
                <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 1.5 }} />

                {/* Action row */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Tooltip title={date ? "Delete this month's budget" : "Select a month first"} arrow>
                    <span>
                      <Button
                        disabled={!date}
                        onClick={handleDelete}
                        variant="outlined"
                        startIcon={<DeleteIcon />}
                        size="small"
                        sx={{
                          color: "#ef5350",
                          borderColor: "#ef5350",
                          "&:hover": { borderColor: "#ef9a9a", backgroundColor: "rgba(239,83,80,0.08)" },
                          "&.Mui-disabled": { color: "rgba(255,255,255,0.15)", borderColor: "rgba(255,255,255,0.1)" },
                        }}
                      >
                        Delete
                      </Button>
                    </span>
                  </Tooltip>
                  <Tooltip title={date ? "Export this month's budget as CSV" : "Select a month first"} arrow>
                    <span>
                      <Button
                        disabled={!date}
                        onClick={handleExportCSVClick}
                        variant="outlined"
                        startIcon={<ArticleOutlinedIcon />}
                        size="small"
                        sx={{
                          color: "rgba(255,255,255,0.7)",
                          borderColor: "rgba(255,255,255,0.25)",
                          "&:hover": { borderColor: "rgba(255,255,255,0.6)", backgroundColor: "rgba(255,255,255,0.05)" },
                          "&.Mui-disabled": { color: "rgba(255,255,255,0.15)", borderColor: "rgba(255,255,255,0.1)" },
                        }}
                      >
                        Export CSV
                      </Button>
                    </span>
                  </Tooltip>

                  <Box sx={{ flex: 1 }} />

                  <Tooltip title="View/edit income sources" arrow>
                    <Button variant="outlined" startIcon={<AttachMoneyIcon />} size="small" onClick={handleViewIncome}
                      sx={{ color: "#4fc3f7", borderColor: "#4fc3f7", "&:hover": { borderColor: "#81d4fa", backgroundColor: "rgba(79,195,247,0.08)" } }}>
                      Income
                    </Button>
                  </Tooltip>
                  <Tooltip title="View/edit fixed expenses" arrow>
                    <Button variant="outlined" startIcon={<RemoveIcon />} size="small" onClick={handleViewExpenses}
                      sx={{ color: "#4fc3f7", borderColor: "#4fc3f7", "&:hover": { borderColor: "#81d4fa", backgroundColor: "rgba(79,195,247,0.08)" } }}>
                      Fixed Expenses
                    </Button>
                  </Tooltip>
                  <Tooltip title="View/edit budget categories" arrow>
                    <Button variant="outlined" startIcon={<FormatListNumberedIcon />} size="small" onClick={handleViewCategories}
                      sx={{ color: "#4fc3f7", borderColor: "#4fc3f7", "&:hover": { borderColor: "#81d4fa", backgroundColor: "rgba(79,195,247,0.08)" } }}>
                      Categories
                    </Button>
                  </Tooltip>
                  <Tooltip title="Generate a budget report" arrow>
                    <Button variant="outlined" startIcon={<LeaderboardIcon />} size="small" onClick={handleGenerateReport}
                      sx={{ color: "#4fc3f7", borderColor: "#4fc3f7", "&:hover": { borderColor: "#81d4fa", backgroundColor: "rgba(79,195,247,0.08)" } }}>
                      Report
                    </Button>
                  </Tooltip>
                </Box>
              </Paper>
            </Grid>
          </>
        ) : (
          <>
            {viewExpenses ? (
              <Grid item xs={12}>
                <Box
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "40px",
                  }}
                >
                  <FixedExpenses
                    setViewExpenses={setViewExpenses}
                    fixedExpenses={fixedExpenses}
                  />
                </Box>
              </Grid>
            ) : (
              <>
                {viewIncome ? (
                  <Grid item xs={12}>
                    <Box
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "40px",
                      }}
                    >
                      <FixedIncome
                        setViewIncome={setViewIncome}
                        fixedIncome={fixedIncome}
                      />
                    </Box>
                  </Grid>
                ) : (
                  <Grid item xs={12}>
                    <Box
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "40px",
                      }}
                    >
                      <BudgetCategories setViewCategories={setViewCategories} />
                    </Box>
                  </Grid>
                )}
              </>
            )}
          </>
        )}
        <Grid item xs={12}>
          <TabBar />
        </Grid>
      </Grid>
    </>
  );
}
