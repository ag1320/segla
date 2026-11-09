import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Box, MenuItem, TextField, Typography } from "@mui/material";
import { saveBusinessPeriodLock } from "../../../state/businessPeriodLocksSlice";
import { setSnackbarSuccess } from "../../../state/uiSlice";
import BusinessFormDialog from "../BusinessFormDialog";
import { formatDate, recentMonthEnds } from "../businessFormat";

// Moving the date later locks more months; moving it earlier (or to
// "Nothing locked") reopens them to fix a mistake. The server only locks
// through a date every active account is reconciled to, so each account's
// reconciled-through date is shown alongside.
export default function LockBooksDialog({ entityId, lockedThroughDate, onClose }) {
  const dispatch = useDispatch();
  const bankAccounts = useSelector((state) => state.businessBankAccounts.items);
  const reconciliations = useSelector((state) => state.businessReconciliations.items);
  const activeAccounts = bankAccounts.filter(
    (bankAccount) => bankAccount.isActive && bankAccount.entityId === entityId
  );
  // Newest first, so the first match is the latest.
  const reconciledThrough = (bankAccountId) =>
    reconciliations.find((item) => item.bankAccountId === bankAccountId)?.statementDate ?? null;
  const monthEnds = recentMonthEnds();
  const choices =
    lockedThroughDate && !monthEnds.includes(lockedThroughDate) ? [...monthEnds, lockedThroughDate] : monthEnds;
  const [choice, setChoice] = useState(lockedThroughDate ?? "");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const isReopening = lockedThroughDate !== null && (choice === "" || choice < lockedThroughDate);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await dispatch(saveBusinessPeriodLock({ entityId, lockedThroughDate: choice || null })).unwrap();
      dispatch(setSnackbarSuccess(true));
      onClose();
    } catch (message) {
      setError(message);
      setSaving(false);
    }
  };

  return (
    <BusinessFormDialog
      title="Lock the books"
      error={error}
      saving={saving}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={isReopening ? "Reopen" : "Lock"}
    >
      <TextField
        select
        label="Locked through"
        value={choice}
        onChange={(event) => setChoice(event.target.value)}
        SelectProps={{ displayEmpty: true }}
        InputLabelProps={{ shrink: true }}
      >
        <MenuItem value="">Nothing locked</MenuItem>
        {choices.map((date) => (
          <MenuItem key={date} value={date}>
            {formatDate(date)}
          </MenuItem>
        ))}
      </TextField>
      <Box>
        <Typography variant="subtitle2">Reconciled through</Typography>
        {activeAccounts.map((bankAccount) => {
          const date = reconciledThrough(bankAccount.id);
          return (
            <Box key={bankAccount.id} sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
              <Typography variant="body2">{bankAccount.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {date ? formatDate(date) : "Never"}
              </Typography>
            </Box>
          );
        })}
      </Box>
      {isReopening && (
        <Alert severity="warning">
          {`Entries dated after ${choice ? formatDate(choice) : "any date"} can be posted and reversed again.`}
        </Alert>
      )}
    </BusinessFormDialog>
  );
}
