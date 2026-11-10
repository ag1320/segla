import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import FlagIcon from "@mui/icons-material/Flag";
import { Box, Checkbox, IconButton, InputAdornment, MenuItem, TextField, Tooltip } from "@mui/material";
import PropertySelect from "../PropertySelect";
import VendorSelect from "../VendorSelect";

const DOLLAR_ADORNMENT = { startAdornment: <InputAdornment position="start">$</InputAdornment> };

// line: { key, accountId, propertyId, vendorId, debit, credit, needsCpaReview },
// where accountId, propertyId and vendorId are "" until chosen and
// debit/credit are dollar text.
export default function JournalLineFields({ line, accounts, properties, vendors, onChange, onRemove }) {
  const handleChange = (field) => (event) => onChange({ [field]: event.target.value });

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
      <TextField
        select
        size="small"
        label="Account"
        value={line.accountId}
        onChange={handleChange("accountId")}
        sx={{ flex: "3 1 220px" }}
      >
        {accounts.map((account) => (
          <MenuItem key={account.id} value={account.id}>
            {`${account.number} ${account.name}`}
          </MenuItem>
        ))}
      </TextField>
      <PropertySelect
        value={line.propertyId}
        properties={properties}
        onChange={(propertyId) => onChange({ propertyId })}
        sx={{ flex: "2 1 150px" }}
      />
      <VendorSelect
        value={line.vendorId}
        vendors={vendors}
        onChange={(vendorId) => onChange({ vendorId })}
        sx={{ flex: "2 1 150px" }}
      />
      <TextField
        size="small"
        label="Debit"
        value={line.debit}
        onChange={handleChange("debit")}
        InputProps={DOLLAR_ADORNMENT}
        inputProps={{ inputMode: "decimal" }}
        sx={{ flex: "1 1 110px" }}
      />
      <TextField
        size="small"
        label="Credit"
        value={line.credit}
        onChange={handleChange("credit")}
        InputProps={DOLLAR_ADORNMENT}
        inputProps={{ inputMode: "decimal" }}
        sx={{ flex: "1 1 110px" }}
      />
      <Tooltip title="Flag for CPA review">
        <Checkbox
          checked={line.needsCpaReview}
          onChange={(event) => onChange({ needsCpaReview: event.target.checked })}
          icon={<FlagOutlinedIcon />}
          checkedIcon={<FlagIcon sx={{ color: "#f9a825" }} />}
          inputProps={{ "aria-label": "flag for CPA review" }}
        />
      </Tooltip>
      <IconButton onClick={onRemove} aria-label="remove line">
        <DeleteOutlineIcon />
      </IconButton>
    </Box>
  );
}
