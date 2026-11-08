import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import FlagIcon from "@mui/icons-material/Flag";
import { Box, Checkbox, IconButton, InputAdornment, MenuItem, TextField, Tooltip } from "@mui/material";

// split: { key, accountId, propertyId, amount, needsCpaReview }, where
// accountId and propertyId are "" until chosen and amount is dollar text.
export default function SplitLineFields({ split, accounts, properties, canRemove, onChange, onRemove }) {
  const handleChange = (field) => (event) => onChange({ [field]: event.target.value });

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
      <TextField
        select
        size="small"
        label="Category"
        value={split.accountId}
        onChange={handleChange("accountId")}
        sx={{ flex: "3 1 220px" }}
      >
        {accounts.map((account) => (
          <MenuItem key={account.id} value={account.id}>
            {`${account.number} ${account.name}`}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        label="Property"
        value={split.propertyId}
        onChange={handleChange("propertyId")}
        SelectProps={{ displayEmpty: true }}
        InputLabelProps={{ shrink: true }}
        sx={{ flex: "2 1 150px" }}
      >
        <MenuItem value="">Company-wide</MenuItem>
        {properties.map((property) => (
          <MenuItem key={property.id} value={property.id}>
            {property.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        size="small"
        label="Amount"
        value={split.amount}
        onChange={handleChange("amount")}
        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
        inputProps={{ inputMode: "decimal" }}
        sx={{ flex: "1 1 120px" }}
      />
      <Tooltip title="Flag for CPA review">
        <Checkbox
          checked={split.needsCpaReview}
          onChange={(event) => onChange({ needsCpaReview: event.target.checked })}
          icon={<FlagOutlinedIcon />}
          checkedIcon={<FlagIcon sx={{ color: "#f9a825" }} />}
          inputProps={{ "aria-label": "flag for CPA review" }}
        />
      </Tooltip>
      <IconButton onClick={onRemove} disabled={!canRemove} aria-label="remove split">
        <DeleteOutlineIcon />
      </IconButton>
    </Box>
  );
}
