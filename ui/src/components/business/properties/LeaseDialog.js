import { useState } from "react";
import { useDispatch } from "react-redux";
import { Box, InputAdornment, TextField } from "@mui/material";
import { addBusinessLease, updateBusinessLease } from "../../../state/businessLeasesSlice";
import { setSnackbarSuccess } from "../../../state/uiSlice";
import BusinessFormDialog from "../BusinessFormDialog";
import { centsToDollarsText, dollarsToCents, isDollarAmount } from "../businessFormat";

const ROW_SX = { display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 };
const dollarAdornment = { startAdornment: <InputAdornment position="start">$</InputAdornment> };

// lease is null when adding.
export default function LeaseDialog({ propertyId, lease, onClose }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    tenantName: lease?.tenantName ?? "",
    unit: lease?.unit ?? "",
    startDate: lease?.startDate ?? "",
    endDate: lease?.endDate ?? "",
    moveOutDate: lease?.moveOutDate ?? "",
    rent: centsToDollarsText(lease?.monthlyRentCents),
    deposit: centsToDollarsText(lease?.depositCents ?? 0),
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const handleSubmit = async () => {
    if (form.rent.trim() === "" || !isDollarAmount(form.rent) || !isDollarAmount(form.deposit)) {
      setError("Enter amounts in dollars, like 2400");
      return;
    }
    const details = {
      tenantName: form.tenantName.trim(),
      unit: form.unit.trim() || null,
      startDate: form.startDate,
      endDate: form.endDate || null,
      moveOutDate: form.moveOutDate || null,
      monthlyRentCents: dollarsToCents(form.rent),
      depositCents: dollarsToCents(form.deposit) ?? 0,
    };

    setSaving(true);
    try {
      const action = lease
        ? updateBusinessLease({ id: lease.id, changes: details })
        : addBusinessLease({ propertyId, ...details });
      await dispatch(action).unwrap();
      dispatch(setSnackbarSuccess(true));
      onClose();
    } catch (message) {
      setError(message);
      setSaving(false);
    }
  };

  const dateField = (field, label, helperText) => (
    <TextField
      label={label}
      type="date"
      value={form[field]}
      onChange={handleChange(field)}
      InputLabelProps={{ shrink: true }}
      helperText={helperText}
      required={field === "startDate"}
    />
  );

  return (
    <BusinessFormDialog
      title={lease ? `Edit lease: ${lease.tenantName}` : "Add Lease"}
      error={error}
      saving={saving}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <Box sx={ROW_SX}>
        <TextField label="Tenant" value={form.tenantName} onChange={handleChange("tenantName")} autoFocus required />
        <TextField label="Unit" value={form.unit} onChange={handleChange("unit")} helperText="Multi-unit only" />
      </Box>
      <Box sx={ROW_SX}>
        {dateField("startDate", "Start")}
        {dateField("endDate", "End", "Blank for month-to-month")}
      </Box>
      <Box sx={ROW_SX}>
        <TextField
          label="Monthly rent"
          value={form.rent}
          onChange={handleChange("rent")}
          InputProps={dollarAdornment}
          inputProps={{ inputMode: "decimal" }}
          required
        />
        <TextField
          label="Deposit"
          value={form.deposit}
          onChange={handleChange("deposit")}
          InputProps={dollarAdornment}
          inputProps={{ inputMode: "decimal" }}
        />
      </Box>
      {lease && dateField("moveOutDate", "Moved out")}
    </BusinessFormDialog>
  );
}
