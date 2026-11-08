import { MenuItem, TextField } from "@mui/material";

// Picking a mortgage replaces the splits with that month's interest,
// principal and escrow from its schedule.
export default function MortgagePaymentSelect({ mortgages, propertyLabel, onPick }) {
  return (
    <TextField
      select
      size="small"
      label="Fill as a mortgage payment"
      value=""
      onChange={(event) => onPick(event.target.value)}
      sx={{ maxWidth: 360 }}
    >
      {mortgages.map((mortgage) => (
        <MenuItem key={mortgage.id} value={mortgage.id}>
          {`${mortgage.lender} · ${propertyLabel(mortgage.propertyId)}`}
        </MenuItem>
      ))}
    </TextField>
  );
}
