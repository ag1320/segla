import { Grid, Button, Box, Typography, Divider, Tooltip } from "@mui/material";
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
  let { setRemainingBalance } = useContext(AppContext);
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
      />
      <Grid container style={{ height: "100%" }}>
        {!viewExpenses && !viewIncome && !viewCategories ? (
          <>
            <Grid item xs={12}>
              <Grid container>
                <Grid item xs={6}>
                  <Box className="actions-header-container">
                    {date ? (
                      <Grid container>
                        <Grid item xs={7}>
                          <Box className="action-text">
                            <Typography
                              component={"span"}
                              textAlign="center"
                              color="white"
                              variant="h6"
                            >
                              Monthly Budget Actions
                            </Typography>
                          </Box>
                          <Divider color="white" />
                        </Grid>
                      </Grid>
                    ) : (
                      <></>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box className="master-lists-header-container">
                    <Box className="master-list-text">
                      <Typography component={"span"} color="white" variant="h6">
                        Main Actions
                      </Typography>
                    </Box>
                    <Divider color="white" />
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Box className="buttons-container">
                <Grid container>
                  <Grid item xs={6}>
                    <Grid container className="action-button-container">
                      <Grid item xs={7}>
                        <Box>
                          {date ? (
                            <Grid
                              container
                              spacing={2}
                              style={{ justifyContent: "center" }}
                            >
                              <Grid item>
                                <Tooltip
                                  title="Delete This Month's Budget"
                                  arrow
                                >
                                  <Button
                                    onClick={handleDelete}
                                    className="delete-budget-button"
                                    variant="outlined"
                                  >
                                    <DeleteIcon className="delete-budget-icon" />
                                    <Typography
                                      component="span"
                                      className="delete-budget-text"
                                    >
                                      Delete
                                    </Typography>
                                  </Button>
                                </Tooltip>
                              </Grid>
                              <Grid item>
                                <Tooltip
                                  title="Export This Month's Budget as '.csv'"
                                  arrow
                                >
                                  <Button
                                    className="export-csv-button"
                                    onClick={handleExportCSVClick}
                                  >
                                    <ArticleOutlinedIcon />
                                    <Typography
                                      component="span"
                                      className="delete-budget-text"
                                    >
                                      Export
                                    </Typography>
                                  </Button>
                                </Tooltip>
                              </Grid>
                            </Grid>
                          ) : (
                            <Grid container>
                              <Grid item xs={9}>
                                <Box className="action-text">
                                  <Typography
                                    component={"span"}
                                    textAlign="center"
                                    color="white"
                                    variant="h4"
                                  >
                                    Your Personal Budget App
                                  </Typography>
                                </Box>
                                <Divider color="white" />
                                <Box className="action-text">
                                  <Typography
                                    component={"span"}
                                    textAlign="center"
                                    color="#777"
                                    variant="h6"
                                  >
                                    Select a Month to Begin
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={6} justifyContent="center">
                    <Box className="view-buttons-container">
                      <Grid
                        container
                        spacing={2}
                        style={{ justifyContent: "center" }}
                      >
                        <Grid item>
                          <Tooltip
                            title="view/edit your monthly fixed income"
                            arrow
                          >
                            <Button
                              variant="outlined"
                              className="view-fixed-income-button"
                              onClick={handleViewIncome}
                            >
                              <AttachMoneyIcon />
                              <Typography
                                component="span"
                                className="delete-budget-text"
                              >
                                Monthly Income
                              </Typography>
                            </Button>
                          </Tooltip>
                        </Grid>
                        <Grid item>
                          <Box
                            style={{
                              width: "100%",
                              display: "flex",
                              justifyContent: "end",
                            }}
                          >
                            <Tooltip
                              title="view/edit your monthly fixed expenses"
                              arrow
                            >
                              <Button
                                variant="outlined"
                                className="view-fixed-expenses-button"
                                onClick={handleViewExpenses}
                              >
                                <RemoveIcon />
                                <AttachMoneyIcon />
                                <Typography
                                  component="span"
                                  className="delete-budget-text"
                                >
                                  Monthly Expenses
                                </Typography>
                              </Button>
                            </Tooltip>
                          </Box>
                        </Grid>
                        <Grid item>
                          <Box
                            style={{
                              width: "100%",
                              display: "flex",
                              justifyContent: "end",
                            }}
                          >
                            <Tooltip
                              title="view/edit your budget categories"
                              arrow
                            >
                              <Button
                                variant="outlined"
                                className="view-budget-categories-button"
                                onClick={handleViewCategories}
                              >
                                <FormatListNumberedIcon />
                                <Typography
                                  component="span"
                                  className="delete-budget-text"
                                >
                                  Budget Categories
                                </Typography>
                              </Button>
                            </Tooltip>
                          </Box>
                        </Grid>
                        <Grid item>
                          <Box
                            style={{
                              width: "100%",
                              display: "flex",
                              justifyContent: "end",
                            }}
                          >
                            <Tooltip title="generate a budget report" arrow>
                              <Button
                                variant="outlined"
                                className="view-generate-report-button"
                                onClick={handleGenerateReport}
                              >
                                <LeaderboardIcon />
                                <Typography
                                  component="span"
                                  className="delete-budget-text"
                                >
                                  Generate Report
                                </Typography>
                              </Button>
                            </Tooltip>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Grid container>
                <Grid item xs={5} className="remaining-balance-container">
                  <RemainingBalance />
                </Grid>
                <Grid item xs={2} />
                <Grid item xs={3}>
                  {date ? (
                    <Donut composition={balance} title="Budget" />
                  ) : (
                    <Donut composition={emptyComposition} title="" />
                  )}
                </Grid>
                <Grid item xs={2} />
              </Grid>
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
