import { useState } from "react";
import { useDispatch } from "react-redux";
import { InputAdornment, TextField } from "@mui/material";
import { addBusinessCapexComponent, updateBusinessCapexComponent } from "../../../state/businessCapexSlice";
import { setSnackbarSuccess } from "../../../state/uiSlice";
import BusinessFormDialog from "../BusinessFormDialog";
import { centsToDollarsText, dollarsToCents, isDollarAmount } from "../businessFormat";

const WHOLE_NUMBER = /^\d+$/;

// component is null when adding.
export default function CapexComponentDialog({ property, component, onClose }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    name: component?.name ?? "",
    installYear: component ? String(component.installYear) : "",
    usefulLifeYears: component ? String(component.usefulLifeYears) : "",
    cost: centsToDollarsText(component?.replacementCostCents),
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const handleSubmit = async () => {
    if (!WHOLE_NUMBER.test(form.installYear) || !WHOLE_NUMBER.test(form.usefulLifeYears)) {
      setError("Enter years as whole numbers, like 2015 and 25");
      return;
    }
    if (form.cost.trim() === "" || !isDollarAmount(form.cost) || dollarsToCents(form.cost) === 0) {
      setError("Enter the cost in dollars, like 15000");
      return;
    }
    const details = {
      name: form.name.trim(),
      installYear: Number(form.installYear),
      usefulLifeYears: Number(form.usefulLifeYears),
      replacementCostCents: dollarsToCents(form.cost),
    };

    setSaving(true);
    try {
      const action = component
        ? updateBusinessCapexComponent({ entityId: property.entityId, id: component.id, changes: details })
        : addBusinessCapexComponent({ entityId: property.entityId, component: { propertyId: property.id, ...details } });
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
      title={component ? `Edit ${component.name}` : "Add Component"}
      error={error}
      saving={saving}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <TextField label="Name" value={form.name} onChange={handleChange("name")} placeholder="e.g. Roof, HVAC" autoFocus required />
      <TextField
        label="Installed (year)"
        value={form.installYear}
        onChange={handleChange("installYear")}
        inputProps={{ inputMode: "numeric" }}
        helperText="Change it after a replacement"
        required
      />
      <TextField
        label="Useful life"
        value={form.usefulLifeYears}
        onChange={handleChange("usefulLifeYears")}
        InputProps={{ endAdornment: <InputAdornment position="end">years</InputAdornment> }}
        inputProps={{ inputMode: "numeric" }}
        required
      />
      <TextField
        label="Replacement cost"
        value={form.cost}
        onChange={handleChange("cost")}
        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
        inputProps={{ inputMode: "decimal" }}
        helperText="Today's price"
        required
      />
    </BusinessFormDialog>
  );
}
