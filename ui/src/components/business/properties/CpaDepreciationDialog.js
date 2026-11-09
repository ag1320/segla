import { useState } from "react";
import { useDispatch } from "react-redux";
import { InputAdornment, TextField, Typography } from "@mui/material";
import { saveBusinessCpaDepreciation } from "../../../state/businessFixedAssetsSlice";
import { setSnackbarSuccess } from "../../../state/uiSlice";
import BusinessFormDialog from "../BusinessFormDialog";
import { centsToDollarsText, dollarsToCents, formatCents, isDollarAmount } from "../businessFormat";

// year: one row of the asset's schedule. Leaving the amount blank removes
// the CPA's figure, so Segla's estimate applies again.
export default function CpaDepreciationDialog({ fixedAsset, year, onClose }) {
  const dispatch = useDispatch();
  const [amount, setAmount] = useState(centsToDollarsText(year.cpaCents));
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!isDollarAmount(amount)) {
      setError("Enter the amount in dollars, like 3334");
      return;
    }
    setSaving(true);
    try {
      await dispatch(
        saveBusinessCpaDepreciation({ id: fixedAsset.id, taxYear: year.taxYear, amountCents: dollarsToCents(amount) })
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
      title={`${fixedAsset.name}: CPA's ${year.taxYear} depreciation`}
      error={error}
      saving={saving}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <Typography variant="body2">
        {`Segla estimated ${formatCents(year.estimateCents)}. Enter the figure from the depreciation schedule in your ${year.taxYear} tax return.`}
      </Typography>
      <TextField
        label="CPA's figure"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
        inputProps={{ inputMode: "decimal" }}
        helperText="Leave blank to go back to Segla's estimate"
        autoFocus
      />
    </BusinessFormDialog>
  );
}
