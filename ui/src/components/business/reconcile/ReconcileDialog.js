import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, InputAdornment, TextField, Typography } from "@mui/material";
import {
  addBusinessReconciliation,
  loadReconciliationWorksheet,
} from "../../../state/businessReconciliationsSlice";
import { setSnackbarSuccess } from "../../../state/uiSlice";
import BusinessFormDialog from "../BusinessFormDialog";
import ReconcileLinesTable from "./ReconcileLinesTable";
import ReconcileSummary from "./ReconcileSummary";
import { formatDate, signedDollarsToCents } from "../businessFormat";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Matches one statement to the ledger. Every open line up to the statement
// date starts checked; uncheck any that aren't on the statement yet.
export default function ReconcileDialog({ bankAccount, onClose }) {
  const dispatch = useDispatch();
  const accountType = useSelector(
    (state) => state.businessAccounts.items.find((account) => account.id === bankAccount.accountId)?.type
  );
  const loadedWorksheet = useSelector((state) => state.businessReconciliations.worksheet);
  const [statementDate, setStatementDate] = useState("");
  const [balanceText, setBalanceText] = useState("");
  const [uncheckedIds, setUncheckedIds] = useState([]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const isCard = accountType === "liability";
  const worksheet =
    loadedWorksheet?.bankAccountId === bankAccount.id && loadedWorksheet.statementDate === statementDate
      ? loadedWorksheet
      : null;
  const checkedLines = worksheet ? worksheet.lines.filter((line) => !uncheckedIds.includes(line.id)) : [];
  const statementBalanceCents = signedDollarsToCents(balanceText);

  const handleDateChange = (event) => {
    const date = event.target.value;
    setStatementDate(date);
    setUncheckedIds([]);
    if (ISO_DATE.test(date)) {
      dispatch(loadReconciliationWorksheet({ bankAccountId: bankAccount.id, statementDate: date }));
    }
  };

  const toggleLine = (lineId) =>
    setUncheckedIds(
      uncheckedIds.includes(lineId) ? uncheckedIds.filter((id) => id !== lineId) : [...uncheckedIds, lineId]
    );
  const setAllChecked = (isChecked) =>
    setUncheckedIds(isChecked ? [] : worksheet.lines.map((line) => line.id));

  const handleSubmit = async () => {
    if (!worksheet || statementBalanceCents === null) {
      setError("Enter the statement date and its ending balance");
      return;
    }
    setSaving(true);
    try {
      await dispatch(
        addBusinessReconciliation({
          bankAccountId: bankAccount.id,
          statementDate,
          statementBalanceCents,
          clearedLineIds: checkedLines.map((line) => line.id),
        })
      ).unwrap();
      dispatch(setSnackbarSuccess(true));
      onClose();
    } catch (message) {
      setError(message);
      setSaving(false);
    }
  };

  return (
    <BusinessFormDialog
      title={`Reconcile ${bankAccount.name}`}
      error={error}
      saving={saving}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel="Finish"
      maxWidth="md"
    >
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        <TextField
          label="Statement end date"
          type="date"
          value={statementDate}
          onChange={handleDateChange}
          InputLabelProps={{ shrink: true }}
          sx={{ flex: "1 1 200px" }}
          required
        />
        <TextField
          label={isCard ? "Statement balance (amount owed)" : "Statement ending balance"}
          value={balanceText}
          onChange={(event) => setBalanceText(event.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
          inputProps={{ inputMode: "decimal" }}
          sx={{ flex: "1 1 200px" }}
          required
        />
      </Box>
      {worksheet && (
        <>
          <Typography variant="body2" color="text.secondary">
            {worksheet.lastStatementDate
              ? `Continuing from the ${formatDate(worksheet.lastStatementDate)} statement`
              : "First reconciliation for this account"}
          </Typography>
          <ReconcileLinesTable
            lines={worksheet.lines}
            uncheckedIds={uncheckedIds}
            onToggle={toggleLine}
            onSetAll={setAllChecked}
          />
          <ReconcileSummary
            startingBalanceCents={worksheet.startingBalanceCents}
            checkedLines={checkedLines}
            statementBalanceCents={statementBalanceCents}
          />
        </>
      )}
    </BusinessFormDialog>
  );
}
