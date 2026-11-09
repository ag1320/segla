import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { InputAdornment, MenuItem, TextField } from "@mui/material";
import {
  addBusinessProperty,
  updateBusinessProperty,
} from "../../../state/businessPropertiesSlice";
import { setSnackbarSuccess } from "../../../state/uiSlice";
import BusinessFormDialog from "../BusinessFormDialog";
import { PROPERTY_STATUS_LABELS } from "../settings/settingsLabels";
import { centsToDollarsText, dollarsToCents, isDollarAmount } from "../businessFormat";

const DOLLAR_ADORNMENT = { startAdornment: <InputAdornment position="start">$</InputAdornment> };

// property is null when adding. A property can't change entities once it
// exists (see LLC_TRANSFER_NOTES.md), so the entity is only chosen on add.
export default function PropertyDialog({ property, onClose }) {
  const dispatch = useDispatch();
  const entities = useSelector((state) => state.businessEntities.items);
  const [form, setForm] = useState({
    entityId: property?.entityId ?? entities[0]?.id ?? "",
    name: property?.name ?? "",
    address: property?.address ?? "",
    status: property?.status ?? "pre_rental",
    targetConversionDate: property?.targetConversionDate ?? "",
    placedInServiceDate: property?.placedInServiceDate ?? "",
    landBasis: centsToDollarsText(property?.landBasisCents),
    buildingBasis: centsToDollarsText(property?.buildingBasisCents),
    marketRent: centsToDollarsText(property?.marketRentCents),
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const handleSubmit = async () => {
    if (![form.landBasis, form.buildingBasis, form.marketRent].every(isDollarAmount)) {
      setError("Enter amounts in dollars, like 250000.00");
      return;
    }
    const details = {
      name: form.name,
      address: form.address || null,
      status: form.status,
      targetConversionDate: form.targetConversionDate || null,
      placedInServiceDate: form.placedInServiceDate || null,
      landBasisCents: dollarsToCents(form.landBasis),
      buildingBasisCents: dollarsToCents(form.buildingBasis),
      marketRentCents: dollarsToCents(form.marketRent),
    };

    setSaving(true);
    try {
      const action = property
        ? updateBusinessProperty({ id: property.id, changes: details })
        : addBusinessProperty({ entityId: form.entityId, ...details });
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
      title={property ? `Edit ${property.name}` : "Add Property"}
      error={error}
      saving={saving}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      {!property && (
        <TextField select label="Owned by" value={form.entityId} onChange={handleChange("entityId")}>
          {entities.map((entity) => (
            <MenuItem key={entity.id} value={entity.id}>
              {entity.name}
            </MenuItem>
          ))}
        </TextField>
      )}
      <TextField label="Name" value={form.name} onChange={handleChange("name")} autoFocus required />
      <TextField label="Address" value={form.address} onChange={handleChange("address")} />
      <TextField select label="Status" value={form.status} onChange={handleChange("status")}>
        {Object.entries(PROPERTY_STATUS_LABELS).map(([status, label]) => (
          <MenuItem key={status} value={status}>
            {label}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Target conversion date"
        type="date"
        value={form.targetConversionDate}
        onChange={handleChange("targetConversionDate")}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Placed in service date"
        type="date"
        value={form.placedInServiceDate}
        onChange={handleChange("placedInServiceDate")}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Land basis"
        value={form.landBasis}
        onChange={handleChange("landBasis")}
        InputProps={DOLLAR_ADORNMENT}
        inputProps={{ inputMode: "decimal" }}
      />
      <TextField
        label="Building basis"
        value={form.buildingBasis}
        onChange={handleChange("buildingBasis")}
        InputProps={DOLLAR_ADORNMENT}
        inputProps={{ inputMode: "decimal" }}
      />
      <TextField
        label="Market rent"
        value={form.marketRent}
        onChange={handleChange("marketRent")}
        InputProps={DOLLAR_ADORNMENT}
        inputProps={{ inputMode: "decimal" }}
        helperText="Per month"
      />
    </BusinessFormDialog>
  );
}
