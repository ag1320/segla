import { useState } from "react";
import { useDispatch } from "react-redux";
import { MenuItem, TextField } from "@mui/material";
import { addBusinessAccount } from "../../../state/businessAccountsSlice";
import { setSnackbarSuccess } from "../../../state/uiSlice";
import BusinessFormDialog from "../BusinessFormDialog";
import ScheduleELineSelect from "./ScheduleELineSelect";
import { ACCOUNT_TYPE_LABELS } from "./settingsLabels";

export default function AddAccountDialog({ onClose }) {
  const dispatch = useDispatch();
  const [accountNumber, setAccountNumber] = useState("");
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState("expense");
  const [scheduleELine, setScheduleELine] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // A line that fit the old type may not fit the new one.
  const handleTypeChange = (event) => {
    setAccountType(event.target.value);
    setScheduleELine(null);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await dispatch(
        addBusinessAccount({
          accountNumber: Number(accountNumber),
          name,
          accountType,
          scheduleELine,
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
      title="Add Account"
      error={error}
      saving={saving}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <TextField
        label="Number"
        type="number"
        value={accountNumber}
        onChange={(event) => setAccountNumber(event.target.value)}
        helperText="Four digits, e.g. 5140"
        autoFocus
        required
      />
      <TextField
        label="Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
      />
      <TextField select label="Type" value={accountType} onChange={handleTypeChange}>
        {Object.entries(ACCOUNT_TYPE_LABELS).map(([type, label]) => (
          <MenuItem key={type} value={type}>
            {label}
          </MenuItem>
        ))}
      </TextField>
      <ScheduleELineSelect
        accountType={accountType}
        value={scheduleELine}
        onChange={setScheduleELine}
      />
    </BusinessFormDialog>
  );
}
