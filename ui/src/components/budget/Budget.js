import { Grid, Button, Box, Typography, Divider, Tooltip, Paper } from "@mui/material";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
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
import DeleteIcon from "@mui/icons-material/Delete";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import RemoveIcon from "@mui/icons-material/Remove";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import ConfirmDeleteBudgetDialog from "./ConfirmDeleteBudgetDialog.js";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import BudgetCategories from "./BudgetCategories.js";
import "./Budget.css";

import { loadFixedExpenses } from "../../state/fixedExpensesSlice";
import { loadFixedIncome } from "../../state/fixedIncomeSlice";
import { loadCurrentBudgetCategories, loadBudgetCategories, clearSnapshotCategories } from "../../state/budgetCategoriesSlice";
import { loadMonthlyIncome, clearMonthlyIncome } from "../../state/monthlyIncomeSlice";
import { loadMonthlyFixedExpenses, loadMonthlyVariedExpenses, clearMonthlyExpenses } from "../../state/monthlyExpensesSlice";
import { loadNotes, exportBudgetCSV, clearNotes } from "../../state/notesSlice";
import { loadMonthEndDistributions, clearMonthEndDistributions } from "../../state/monthEndDistributionsSlice";
import { setReason, setNewBudget, seedBudget, deleteBudgetMonth, toggleBudgetRefresh } from "../../state/budgetSlice";
import { setSnackbarSuccess, setSnackbarError } from "../../state/uiSlice";
import { selectBudgetBalance } from "../../utilities/helperFunctions";

export default function Budget() {
  //fixedMonthlyExpenses is are fixed expenses for that individual month
  //these are displayed on the budget tab bar item fixed monthly expenses
  //In contrast, fixedExpenses are the master fixed expenses
  const dispatch = useDispatch();

  const date = useSelector((state) => state.budget.date);
  const newBudget = useSelector((state) => state.budget.newBudget);
  const budgetRefresh = useSelector((state) => state.budget.budgetRefresh);
  const notes = useSelector((state) => state.notes.items);
  const fixedIncome = useSelector((state) => state.fixedIncome.items);
  const fixedExpenses = useSelector((state) => state.fixedExpenses.items);
  const currentBudgetCategories = useSelector((state) => state.budgetCategories.currentCategories);
  const { remainingBalance, budgetSummary } = useSelector(selectBudgetBalance);

  const [confirmFixed, setConfirmFixed] = useState(false);
  const [confirmDeleteBudget, setConfirmDeleteBudget] = useState(false);
  const [viewExpenses, setViewExpenses] = useState(false);
  const [viewIncome, setViewIncome] = useState(false);
  const [viewCategories, setViewCategories] = useState(false);
  const [viewGenerateReport, setViewGenerateReport] = useState(false);
  const [viewReport, setViewReport] = useState(false);
  const [openConfirmExport, setOpenConfirmExport] = useState(false);

  const emptyComposition = {
    remaining: 1,
  };

  const handleFixedConfirm = () => {
    let month = date.toLocaleString("EN-US", { month: "long" });
    let year = date.getFullYear();
    dispatch(
      seedBudget({ fixedExpenses, fixedIncome, month, year, currentBudgetCategories })
    ).then(() => {
      dispatch(setReason("Budget"));
      dispatch(toggleBudgetRefresh());
    });
  };

  const handleDeleteConfirm = () => {
    let month = date?.toLocaleString("EN-US", { month: "long" });
    let year = date?.getFullYear();
    dispatch(deleteBudgetMonth({ month, year }))
      .unwrap()
      .then(() => {
        dispatch(setSnackbarSuccess(true));
        dispatch(setReason("budget"));
      })
      .catch(() => dispatch(setSnackbarError(true)));
  };

  const handleDelete = () => {
    setConfirmDeleteBudget(true);
  };

  const handleExportCSV = (isExported) => {
    let month = date?.toLocaleString("EN-US", { month: "long" });
    let year = date?.getFullYear();
    dispatch(exportBudgetCSV({ month, year, isExported }))
      .unwrap()
      .then(() => {
        dispatch(setSnackbarSuccess(true));
        dispatch(setReason("note"));
      })
      .catch(() => dispatch(setSnackbarError(true)));
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

  // Master lists (not month-scoped) - load once on mount.
  useEffect(() => {
    dispatch(loadFixedExpenses());
    dispatch(loadFixedIncome());
    dispatch(loadCurrentBudgetCategories());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // Month-scoped data - load whenever the selected month changes, or a
  // budget-level action (seed/delete/export) forces a same-month reload.
  useEffect(() => {
    if (!date) {
      dispatch(clearMonthlyIncome());
      dispatch(clearMonthlyExpenses());
      dispatch(clearSnapshotCategories());
      dispatch(clearMonthEndDistributions());
      dispatch(clearNotes());
      return;
    }
    let month = date.toLocaleString("EN-US", { month: "long" });
    let year = date.getFullYear();
    dispatch(loadMonthlyFixedExpenses({ month, year }));
    dispatch(loadMonthlyIncome({ month, year }));
    dispatch(loadMonthlyVariedExpenses({ month, year }));
    dispatch(loadBudgetCategories({ month, year }));
    dispatch(loadNotes({ month, year }));
    dispatch(loadMonthEndDistributions({ month, year }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, budgetRefresh, dispatch]);

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
        setOpen={(value) => dispatch(setNewBudget(value))}
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
                      <Donut composition={budgetSummary} title="Budget" />
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
