import { useState } from "react";
import { useDispatch } from "react-redux";
import { TextField, Typography } from "@mui/material";
import { reverseBusinessJournalEntry } from "../../../state/businessJournalEntriesSlice";
import { setSnackbarSuccess } from "../../../state/uiSlice";
import BusinessFormDialog from "../BusinessFormDialog";
import { formatDate, todayDateString } from "../businessFormat";

// A reversal can't be dated before the entry it reverses, so a
// future-dated entry defaults to its own date instead of today.
export default function ReverseEntryDialog({ entry, onClose }) {
  const dispatch = useDispatch();
  const today = todayDateString();
  const [entryDate, setEntryDate] = useState(entry.entryDate > today ? entry.entryDate : today);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await dispatch(reverseBusinessJournalEntry({ id: entry.id, entryDate })).unwrap();
      dispatch(setSnackbarSuccess(true));
      onClose();
    } catch (message) {
      setError(message);
      setSaving(false);
    }
  };

  return (
    <BusinessFormDialog
      title={`Reverse entry #${entry.id}`}
      error={error}
      saving={saving}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel="Reverse"
    >
      <Typography variant="body2">
        {`${formatDate(entry.entryDate)}${entry.memo ? ` · ${entry.memo}` : ""}`}
      </Typography>
      <Typography variant="body2">
        Posts a new entry that swaps every debit and credit.
      </Typography>
      <TextField
        label="Reversal date"
        type="date"
        value={entryDate}
        onChange={(event) => setEntryDate(event.target.value)}
        InputLabelProps={{ shrink: true }}
        required
      />
    </BusinessFormDialog>
  );
}
