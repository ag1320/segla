import { useState } from "react";
import { useDispatch } from "react-redux";
import { InputAdornment, MenuItem, TextField } from "@mui/material";
import {
  addBusinessPropertyValuation,
  updateBusinessPropertyValuation,
} from "../../../state/businessPropertyValuationsSlice";
import { setSnackbarSuccess } from "../../../state/uiSlice";
import BusinessFormDialog from "../BusinessFormDialog";
import { VALUATION_SOURCE_LABELS } from "./propertyLabels";
import { centsToDollarsText, dollarsToCents, isDollarAmount, todayDateString } from "../businessFormat";

// valuation is null when adding.
export default function ValuationDialog({ propertyId, valuation, onClose }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    valuationDate: valuation?.valuationDate ?? todayDateString(),
    value: centsToDollarsText(valuation?.valueCents),
    source: valuation?.source ?? "online_estimate",
    note: valuation?.note ?? "",
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const handleSubmit = async () => {
    if (form.value.trim() === "" || !isDollarAmount(form.value) || dollarsToCents(form.value) === 0) {
      setError("Enter the value in dollars, like 325000");
      return;
    }
    const details = {
      valuationDate: form.valuationDate,
      valueCents: dollarsToCents(form.value),
      source: form.source,
      note: form.note.trim() || null,
    };

    setSaving(true);
    try {
      const action = valuation
        ? updateBusinessPropertyValuation({ id: valuation.id, propertyId, changes: details })
        : addBusinessPropertyValuation({ propertyId, valuation: details });
      await dispatch(action).unwrap();
      dispatch(setSnackbarSuccess(true));
      onClose();
    } catch (message) {
      setError(message);
      setSaving(false);
    }
  };

  return (
    <BusinessFormDialog
      title={valuation ? "Edit Valuation" : "Add Valuation"}
      error={error}
      saving={saving}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <TextField
        label="Date"
        type="date"
        value={form.valuationDate}
        onChange={handleChange("valuationDate")}
        InputLabelProps={{ shrink: true }}
        required
      />
      <TextField
        label="Value"
        value={form.value}
        onChange={handleChange("value")}
        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
        inputProps={{ inputMode: "decimal" }}
        autoFocus
        required
      />
      <TextField select label="Source" value={form.source} onChange={handleChange("source")}>
        {Object.entries(VALUATION_SOURCE_LABELS).map(([source, label]) => (
          <MenuItem key={source} value={source}>
            {label}
          </MenuItem>
        ))}
      </TextField>
      <TextField label="Note" value={form.note} onChange={handleChange("note")} placeholder="e.g. Zillow, Redfin" />
    </BusinessFormDialog>
  );
}
