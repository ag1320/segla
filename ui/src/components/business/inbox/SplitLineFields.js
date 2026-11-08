import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import FlagIcon from "@mui/icons-material/Flag";
import { Box, Checkbox, IconButton, InputAdornment, MenuItem, TextField, Tooltip } from "@mui/material";
import PropertySelect from "../PropertySelect";
import VendorSelect from "../VendorSelect";

// split: { key, accountId, propertyId, vendorId, amount, needsCpaReview },
// where the ids are "" until chosen and amount is dollar text.
export default function SplitLineFields({ split, accounts, properties, vendors, canRemove, onChange, onRemove }) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
      <TextField
        select
        size="small"
        label="Category"
        value={split.accountId}
        onChange={(event) => onChange({ accountId: event.target.value })}
        sx={{ flex: "3 1 220px" }}
      >
        {accounts.map((account) => (
          <MenuItem key={account.id} value={account.id}>
            {`${account.number} ${account.name}`}
          </MenuItem>
        ))}
      </TextField>
      <PropertySelect
        value={split.propertyId}
        properties={properties}
        onChange={(propertyId) => onChange({ propertyId })}
        sx={{ flex: "2 1 150px" }}
      />
      <VendorSelect
        value={split.vendorId}
        vendors={vendors}
        onChange={(vendorId) => onChange({ vendorId })}
        sx={{ flex: "2 1 150px" }}
      />
      <TextField
        size="small"
        label="Amount"
        value={split.amount}
        onChange={(event) => onChange({ amount: event.target.value })}
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
