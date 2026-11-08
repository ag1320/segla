import { useState } from "react";
import { useDispatch } from "react-redux";
import { InputAdornment, TextField } from "@mui/material";
import { addBusinessMortgage, updateBusinessMortgage } from "../../../state/businessMortgagesSlice";
import { setSnackbarSuccess } from "../../../state/uiSlice";
import BusinessFormDialog from "../BusinessFormDialog";
import { centsToDollarsText, dollarsToCents, isDollarAmount } from "../businessFormat";

const RATE = /^\d{1,2}(\.\d{1,4})?$/;
const WHOLE_NUMBER = /^\d+$/;

const dollarAdornment = { startAdornment: <InputAdornment position="start">$</InputAdornment> };

// mortgage is null when adding. The schedule starts from a balance and the
// first payment at that balance: the amount borrowed for a new loan, or the
// balance taken over for an assumed one. Either way the monthly payment
// comes out the same.
export default function MortgageDialog({ propertyId, mortgage, onClose }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    lender: mortgage?.lender ?? "",
    principal: centsToDollarsText(mortgage?.originalPrincipalCents),
    rate: mortgage ? String(mortgage.annualRatePercent) : "",
    termMonths: mortgage ? String(mortgage.termMonths) : "360",
    firstPaymentDate: mortgage?.firstPaymentDate ?? "",
    escrow: centsToDollarsText(mortgage?.monthlyEscrowCents ?? 0),
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const handleSubmit = async () => {
    if (form.principal.trim() === "" || !isDollarAmount(form.principal) || !isDollarAmount(form.escrow)) {
      setError("Enter amounts in dollars, like 300000");
      return;
    }
    if (!RATE.test(form.rate.trim())) {
      setError("Enter the rate as a percent, like 2.75");
      return;
    }
    if (!WHOLE_NUMBER.test(form.termMonths.trim()) || Number(form.termMonths) === 0) {
      setError("Enter the number of monthly payments, like 360");
      return;
    }
    const terms = {
      lender: form.lender.trim(),
      originalPrincipalCents: dollarsToCents(form.principal),
      annualRatePercent: Number(form.rate),
      termMonths: Number(form.termMonths),
      firstPaymentDate: form.firstPaymentDate,
      monthlyEscrowCents: dollarsToCents(form.escrow) ?? 0,
    };

    setSaving(true);
    try {
      const action = mortgage
        ? updateBusinessMortgage({ id: mortgage.id, changes: terms })
        : addBusinessMortgage({ propertyId, ...terms });
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
      title={mortgage ? "Edit Mortgage" : "Add Mortgage"}
      error={error}
      saving={saving}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <TextField label="Lender" value={form.lender} onChange={handleChange("lender")} autoFocus required />
      <TextField
        label="Starting balance"
        value={form.principal}
        onChange={handleChange("principal")}
        InputProps={dollarAdornment}
        inputProps={{ inputMode: "decimal" }}
        helperText="The amount borrowed, or the balance when you took the loan over"
        required
      />
      <TextField
        label="Interest rate"
        value={form.rate}
        onChange={handleChange("rate")}
        InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
        inputProps={{ inputMode: "decimal" }}
        required
      />
      <TextField
        label="Number of payments"
        value={form.termMonths}
        onChange={handleChange("termMonths")}
        InputProps={{ endAdornment: <InputAdornment position="end">months</InputAdornment> }}
        inputProps={{ inputMode: "numeric" }}
        helperText="From the first payment through the maturity date, counting both (360 for a new 30-year loan)"
        required
      />
      <TextField
        label="First payment due"
        type="date"
        value={form.firstPaymentDate}
        onChange={handleChange("firstPaymentDate")}
        InputLabelProps={{ shrink: true }}
        helperText="The first payment made at the starting balance"
        required
      />
      <TextField
        label="Escrow per month"
        value={form.escrow}
        onChange={handleChange("escrow")}
        InputProps={dollarAdornment}
        inputProps={{ inputMode: "decimal" }}
        helperText="From your latest statement. Update it after each yearly escrow analysis."
      />
    </BusinessFormDialog>
  );
}
