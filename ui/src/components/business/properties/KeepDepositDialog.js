import { useState } from "react";
import { useDispatch } from "react-redux";
import { InputAdornment, TextField } from "@mui/material";
import { keepBusinessDeposit } from "../../../state/businessLeasesSlice";
import { setSnackbarSuccess } from "../../../state/uiSlice";
import BusinessFormDialog from "../BusinessFormDialog";
import { dollarsToCents, isDollarAmount, todayDateString } from "../businessFormat";

// The part of a deposit kept for damages or unpaid rent becomes income.
// The refund of the rest is categorized in the Inbox to 2100.
export default function KeepDepositDialog({ lease, onClose }) {
  const dispatch = useDispatch();
  const [entryDate, setEntryDate] = useState(lease.moveOutDate ?? todayDateString());
  const [amount, setAmount] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (amount.trim() === "" || !isDollarAmount(amount) || dollarsToCents(amount) === 0) {
      setError("Enter the amount in dollars, like 300");
      return;
    }
    setSaving(true);
    try {
      await dispatch(keepBusinessDeposit({ id: lease.id, entryDate, amountCents: dollarsToCents(amount) })).unwrap();
      dispatch(setSnackbarSuccess(true));
      onClose();
    } catch (message) {
      setError(message);
      setSaving(false);
    }
  };

  return (
    <BusinessFormDialog
      title={`Keep deposit: ${lease.tenantName}`}
      error={error}
      saving={saving}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel="Post"
    >
      <TextField
        label="Date"
        type="date"
        value={entryDate}
        onChange={(event) => setEntryDate(event.target.value)}
        InputLabelProps={{ shrink: true }}
        required
      />
      <TextField
        label="Amount kept"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
        inputProps={{ inputMode: "decimal" }}
        helperText="Refund the rest through the Inbox"
        autoFocus
        required
      />
    </BusinessFormDialog>
  );
}
