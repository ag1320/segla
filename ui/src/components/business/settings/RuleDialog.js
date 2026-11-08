import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MenuItem, TextField } from "@mui/material";
import { addBusinessRule, updateBusinessRule } from "../../../state/businessRulesSlice";
import { setSnackbarSuccess } from "../../../state/uiSlice";
import BusinessFormDialog from "../BusinessFormDialog";
import PropertySelect from "../PropertySelect";
import VendorSelect from "../VendorSelect";

// rule is null when adding.
export default function RuleDialog({ rule, onClose }) {
  const dispatch = useDispatch();
  const allAccounts = useSelector((state) => state.businessAccounts.items);
  const accounts = allAccounts.filter((account) => account.isActive || account.id === rule?.accountId);
  const properties = useSelector((state) => state.businessProperties.items);
  const vendors = useSelector((state) => state.businessVendors.items);
  const [form, setForm] = useState({
    descriptionPattern: rule?.descriptionPattern ?? "",
    accountId: rule?.accountId ?? "",
    propertyId: rule?.propertyId ?? "",
    vendorId: rule?.vendorId ?? "",
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const setField = (field) => (value) => setForm({ ...form, [field]: value });

  const handleSubmit = async () => {
    if (form.accountId === "") {
      setError("Pick a category");
      return;
    }
    const details = {
      descriptionPattern: form.descriptionPattern.trim(),
      accountId: form.accountId,
      propertyId: form.propertyId === "" ? null : form.propertyId,
      vendorId: form.vendorId === "" ? null : form.vendorId,
    };

    setSaving(true);
    try {
      const action = rule ? updateBusinessRule({ id: rule.id, changes: details }) : addBusinessRule(details);
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
      title={rule ? "Edit Rule" : "Add Rule"}
      error={error}
      saving={saving}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <TextField
        label="Description contains"
        value={form.descriptionPattern}
        onChange={(event) => setField("descriptionPattern")(event.target.value)}
        helperText="Ignores capitals, e.g. HOME DEPOT"
        autoFocus
        required
      />
      <TextField
        select
        label="Category"
        value={form.accountId}
        onChange={(event) => setField("accountId")(event.target.value)}
      >
        {accounts.map((account) => (
          <MenuItem key={account.id} value={account.id}>
            {`${account.number} ${account.name}`}
          </MenuItem>
        ))}
      </TextField>
      <PropertySelect
        size="medium"
        value={form.propertyId}
        properties={properties}
        onChange={setField("propertyId")}
      />
      <VendorSelect size="medium" value={form.vendorId} vendors={vendors} onChange={setField("vendorId")} />
    </BusinessFormDialog>
  );
}
