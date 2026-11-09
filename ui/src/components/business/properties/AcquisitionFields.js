import { Box, InputAdornment, MenuItem, TextField, Typography } from "@mui/material";
import { formatCents, formatDate } from "../businessFormat";

// [field, label, helper] for each dollar amount, in closing-statement order.
const COST_FIELDS = [
  ["purchasePrice", "Purchase price"],
  ["capitalizedCosts", "Closing costs", "Title, recording, transfer tax"],
  ["sellerCredits", "Seller credits"],
  ["loanCosts", "Lender fees", "Points, origination"],
  ["prepaidInterest", "Prepaid interest"],
  ["propertyTax", "Property tax"],
  ["insurance", "Insurance"],
  ["escrowDeposit", "Escrow deposit"],
];

const PAID_FIELDS = [
  ["loanAmount", "Loan amount"],
  ["personalFunds", "Personal money", "e.g. earnest money"],
];

const GRID_SX = { display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 };
const dollarAdornment = { startAdornment: <InputAdornment position="start">$</InputAdornment> };

// value: the form's text fields; wires: Inbox money-out transactions that
// could be the payment to the closing.
export default function AcquisitionFields({ value, wires, onChange }) {
  const handleChange = (field) => (event) => onChange({ ...value, [field]: event.target.value });

  const dollarField = ([field, label, helper]) => (
    <TextField
      key={field}
      label={label}
      value={value[field]}
      onChange={handleChange(field)}
      InputProps={dollarAdornment}
      inputProps={{ inputMode: "decimal" }}
      helperText={helper}
      size="small"
    />
  );

  return (
    <>
      <Box sx={GRID_SX}>
        <TextField
          label="Closing date"
          type="date"
          size="small"
          value={value.closingDate}
          onChange={handleChange("closingDate")}
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          label="In service"
          type="date"
          size="small"
          value={value.inServiceDate}
          onChange={handleChange("inServiceDate")}
          InputLabelProps={{ shrink: true }}
          helperText="Day it's available for rent"
          required
        />
      </Box>
      <Typography variant="subtitle2">Cost</Typography>
      <Box sx={GRID_SX}>
        {dollarField(COST_FIELDS[0])}
        <TextField
          label="Land share"
          size="small"
          value={value.landPercent}
          onChange={handleChange("landPercent")}
          InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
          inputProps={{ inputMode: "decimal" }}
          helperText="From the appraisal or assessor"
          required
        />
        {COST_FIELDS.slice(1).map(dollarField)}
      </Box>
      <Typography variant="subtitle2">Paid by</Typography>
      <Box sx={GRID_SX}>
        {PAID_FIELDS.map(dollarField)}
        <TextField
          select
          size="small"
          label="Bank payment"
          value={value.bankTransactionId}
          onChange={handleChange("bankTransactionId")}
          SelectProps={{ displayEmpty: true }}
          InputLabelProps={{ shrink: true }}
        >
          <MenuItem value="">Not imported yet</MenuItem>
          {wires.map((wire) => (
            <MenuItem key={wire.id} value={wire.id}>
              {`${formatDate(wire.transactionDate)} · ${formatCents(-wire.amountCents)} · ${wire.description}`}
            </MenuItem>
          ))}
        </TextField>
        {value.bankTransactionId === "" && dollarField(["bank", "From business checking"])}
      </Box>
    </>
  );
}
