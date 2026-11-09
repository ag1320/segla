import { useState } from "react";
import { useDispatch } from "react-redux";
import { InputAdornment, MenuItem, TextField } from "@mui/material";
import { addBusinessFixedAsset, updateBusinessFixedAsset } from "../../../state/businessFixedAssetsSlice";
import { setSnackbarSuccess } from "../../../state/uiSlice";
import BusinessFormDialog from "../BusinessFormDialog";
import { ASSET_CLASS_LABELS } from "./propertyLabels";
import { centsToDollarsText, dollarsToCents, isDollarAmount } from "../businessFormat";

// fixedAsset is null when adding.
export default function FixedAssetDialog({ propertyId, fixedAsset, onClose }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    name: fixedAsset?.name ?? "",
    assetClass: fixedAsset?.assetClass ?? "building",
    cost: centsToDollarsText(fixedAsset?.costCents),
    inServiceDate: fixedAsset?.inServiceDate ?? "",
    disposalDate: fixedAsset?.disposalDate ?? "",
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const handleSubmit = async () => {
    if (form.cost.trim() === "" || !isDollarAmount(form.cost) || dollarsToCents(form.cost) === 0) {
      setError("Enter the cost in dollars, like 200000");
      return;
    }
    const details = {
      name: form.name.trim(),
      assetClass: form.assetClass,
      costCents: dollarsToCents(form.cost),
      inServiceDate: form.inServiceDate,
      disposalDate: form.disposalDate || null,
    };

    setSaving(true);
    try {
      const action = fixedAsset
        ? updateBusinessFixedAsset({ id: fixedAsset.id, changes: details })
        : addBusinessFixedAsset({ propertyId, ...details });
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
      title={fixedAsset ? `Edit ${fixedAsset.name}` : "Add Fixed Asset"}
      error={error}
      saving={saving}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <TextField label="Name" value={form.name} onChange={handleChange("name")} placeholder="e.g. House, Roof 2029" autoFocus required />
      <TextField select label="Kind" value={form.assetClass} onChange={handleChange("assetClass")}>
        {Object.entries(ASSET_CLASS_LABELS).map(([assetClass, label]) => (
          <MenuItem key={assetClass} value={assetClass}>
            {label}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Cost (depreciable basis)"
        value={form.cost}
        onChange={handleChange("cost")}
        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
        inputProps={{ inputMode: "decimal" }}
        required
      />
      <TextField
        label="In service"
        type="date"
        value={form.inServiceDate}
        onChange={handleChange("inServiceDate")}
        InputLabelProps={{ shrink: true }}
        required
      />
      <TextField
        label="Disposed of"
        type="date"
        value={form.disposalDate}
        onChange={handleChange("disposalDate")}
        InputLabelProps={{ shrink: true }}
        helperText="Leave blank while you still have it"
      />
    </BusinessFormDialog>
  );
}
