import { useState } from "react";
import { useDispatch } from "react-redux";
import { FormControlLabel, Switch, TextField } from "@mui/material";
import { addBusinessVendor, updateBusinessVendor } from "../../../state/businessVendorsSlice";
import { setSnackbarSuccess } from "../../../state/uiSlice";
import BusinessFormDialog from "../BusinessFormDialog";

// vendor is null when adding. Only where the W-9 is kept is stored, never
// the tax ID on it.
export default function VendorDialog({ vendor, onClose }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    name: vendor?.name ?? "",
    is1099Eligible: vendor?.is1099Eligible ?? false,
    hasW9OnFile: vendor?.hasW9OnFile ?? false,
    w9Location: vendor?.w9Location ?? "",
    isActive: vendor?.isActive ?? true,
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSwitch = (field) => (event) => setForm({ ...form, [field]: event.target.checked });

  const handleSubmit = async () => {
    const details = { ...form, w9Location: form.w9Location.trim() || null };
    setSaving(true);
    try {
      const action = vendor
        ? updateBusinessVendor({ id: vendor.id, changes: details })
        : addBusinessVendor(details);
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
      title={vendor ? `Edit ${vendor.name}` : "Add Vendor"}
      error={error}
      saving={saving}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <TextField
        label="Name"
        value={form.name}
        onChange={(event) => setForm({ ...form, name: event.target.value })}
        autoFocus
        required
      />
      <FormControlLabel
        label="1099 eligible (a person or unincorporated business doing services)"
        control={<Switch checked={form.is1099Eligible} onChange={handleSwitch("is1099Eligible")} />}
      />
      <FormControlLabel
        label="W-9 on file"
        control={<Switch checked={form.hasW9OnFile} onChange={handleSwitch("hasW9OnFile")} />}
      />
      <TextField
        label="Where the W-9 is kept"
        value={form.w9Location}
        onChange={(event) => setForm({ ...form, w9Location: event.target.value })}
      />
      {vendor && (
        <FormControlLabel
          label="Active"
          control={<Switch checked={form.isActive} onChange={handleSwitch("isActive")} />}
        />
      )}
    </BusinessFormDialog>
  );
}
