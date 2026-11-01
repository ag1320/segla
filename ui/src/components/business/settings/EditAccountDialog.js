import { useState } from "react";
import { useDispatch } from "react-redux";
import { FormControlLabel, Switch, TextField } from "@mui/material";
import { updateBusinessAccount } from "../../../state/businessAccountsSlice";
import { setSnackbarSuccess } from "../../../state/uiSlice";
import BusinessFormDialog from "../BusinessFormDialog";
import ScheduleELineSelect from "./ScheduleELineSelect";
import { ACCOUNT_TYPE_LABELS } from "./settingsLabels";

// The number and type are fixed once an account exists, because past
// entries were posted against them.
export default function EditAccountDialog({ account, onClose }) {
  const dispatch = useDispatch();
  const [name, setName] = useState(account.name);
  const [scheduleELine, setScheduleELine] = useState(account.scheduleELine);
  const [isActive, setIsActive] = useState(account.isActive);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await dispatch(
        updateBusinessAccount({
          id: account.id,
          changes: { name, scheduleELine, isActive },
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
      title={`Edit ${account.number} · ${ACCOUNT_TYPE_LABELS[account.type]}`}
      error={error}
      saving={saving}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <TextField
        label="Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        autoFocus
        required
      />
      <ScheduleELineSelect
        accountType={account.type}
        value={scheduleELine}
        onChange={setScheduleELine}
      />
      <FormControlLabel
        label="Active"
        control={
          <Switch checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
        }
      />
    </BusinessFormDialog>
  );
}
