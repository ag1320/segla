import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Button, InputAdornment, TextField } from "@mui/material";
import { previewBusinessConversion, convertBusinessProperty } from "../../../state/businessPropertiesSlice";
import { loadBusinessAccounts } from "../../../state/businessAccountsSlice";
import { setSnackbarSuccess } from "../../../state/uiSlice";
import BusinessFormDialog from "../BusinessFormDialog";
import ConversionReview from "./ConversionReview";
import useScheduledMortgageBalance from "./useScheduledMortgageBalance";
import {
  centsToDollarsText,
  dollarsToCents,
  formatCents,
  isDollarAmount,
  signedDollarsToCents,
} from "../businessFormat";

const PERCENT = /^\d{1,3}(\.\d{1,2})?$/;
const dollarAdornment = { startAdornment: <InputAdornment position="start">$</InputAdornment> };

// The day a residence becomes a rental: enter the numbers, review the one
// entry it posts, then post it.
export default function ConversionDialog({ property, onClose }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    placedInServiceDate: property.targetConversionDate ?? "",
    adjustedBasis: "",
    fairMarketValue: "",
    landPercent: "",
    mortgageBalance: "",
    escrowBalance: "0",
  });
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const scheduledBalance = useScheduledMortgageBalance(property.id, form.placedInServiceDate);

  useEffect(() => {
    dispatch(loadBusinessAccounts());
  }, [dispatch]);

  const handleChange = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const conversion = () => ({
    placedInServiceDate: form.placedInServiceDate,
    adjustedBasisCents: dollarsToCents(form.adjustedBasis),
    fairMarketValueCents: dollarsToCents(form.fairMarketValue),
    landPercent: Number(form.landPercent),
    mortgageBalanceCents: dollarsToCents(form.mortgageBalance) ?? 0,
    escrowBalanceCents: signedDollarsToCents(form.escrowBalance) ?? 0,
  });

  const run = async (thunk, onDone) => {
    setSaving(true);
    try {
      const result = await dispatch(thunk({ propertyId: property.id, conversion: conversion() })).unwrap();
      setError(null);
      onDone(result);
    } catch (message) {
      setError(message);
    }
    setSaving(false);
  };

  const handleReview = () => {
    const amounts = [form.adjustedBasis, form.fairMarketValue, form.mortgageBalance];
    const escrowIsValid = form.escrowBalance.trim() === "" || signedDollarsToCents(form.escrowBalance) !== null;
    if (
      form.adjustedBasis.trim() === "" ||
      form.fairMarketValue.trim() === "" ||
      !amounts.every(isDollarAmount) ||
      !escrowIsValid
    ) {
      setError("Enter amounts in dollars, like 300000");
      return;
    }
    if (!PERCENT.test(form.landPercent.trim()) || Number(form.landPercent) >= 100) {
      setError("Enter the land share as a percent under 100, like 20");
      return;
    }
    run(previewBusinessConversion, setPreview);
  };

  const handlePost = () =>
    run(convertBusinessProperty, () => {
      dispatch(setSnackbarSuccess(true));
      onClose();
    });

  return (
    <BusinessFormDialog
      title={`Convert ${property.name} to a rental`}
      error={error}
      saving={saving}
      onClose={onClose}
      onSubmit={preview ? handlePost : handleReview}
      submitLabel={preview ? "Post conversion" : "Review"}
      maxWidth="sm"
    >
      {preview ? (
        <>
          <ConversionReview preview={preview} />
          <Button onClick={() => setPreview(null)} sx={{ alignSelf: "flex-start" }}>
            Back
          </Button>
        </>
      ) : (
        <>
          <TextField
            label="Placed in service"
            type="date"
            value={form.placedInServiceDate}
            onChange={handleChange("placedInServiceDate")}
            InputLabelProps={{ shrink: true }}
            helperText="Day it's available for rent"
            required
          />
          <TextField
            label="Adjusted basis"
            value={form.adjustedBasis}
            onChange={handleChange("adjustedBasis")}
            InputProps={dollarAdornment}
            inputProps={{ inputMode: "decimal" }}
            helperText="Price + closing costs + improvements"
            required
          />
          <TextField
            label="Market value"
            value={form.fairMarketValue}
            onChange={handleChange("fairMarketValue")}
            InputProps={dollarAdornment}
            inputProps={{ inputMode: "decimal" }}
            helperText="From the appraisal"
            required
          />
          <TextField
            label="Land share"
            value={form.landPercent}
            onChange={handleChange("landPercent")}
            InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
            inputProps={{ inputMode: "decimal" }}
            helperText="From the appraisal or assessor"
            required
          />
          <TextField
            label="Mortgage balance"
            value={form.mortgageBalance}
            onChange={handleChange("mortgageBalance")}
            InputProps={dollarAdornment}
            inputProps={{ inputMode: "decimal" }}
            helperText={scheduledBalance === null ? null : `Schedule: ${formatCents(scheduledBalance)}`}
          />
          {scheduledBalance !== null && (
            <Button
              size="small"
              onClick={() => setForm({ ...form, mortgageBalance: centsToDollarsText(scheduledBalance) })}
              sx={{ alignSelf: "flex-start", mt: -1 }}
            >
              Use schedule balance
            </Button>
          )}
          <TextField
            label="Escrow balance"
            value={form.escrowBalance}
            onChange={handleChange("escrowBalance")}
            InputProps={dollarAdornment}
            inputProps={{ inputMode: "decimal" }}
            helperText="Use a minus sign for a deficit"
          />
        </>
      )}
    </BusinessFormDialog>
  );
}
