import { MenuItem, TextField } from "@mui/material";

// value is a vendor id, or "" for none. Only active vendors are offered,
// plus the current one if it has since been made inactive.
export default function VendorSelect({ value, vendors, onChange, size = "small", sx }) {
  const choices = vendors.filter((vendor) => vendor.isActive || vendor.id === value);

  return (
    <TextField
      select
      size={size}
      label="Vendor"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      SelectProps={{ displayEmpty: true }}
      InputLabelProps={{ shrink: true }}
      sx={sx}
    >
      <MenuItem value="">None</MenuItem>
      {choices.map((vendor) => (
        <MenuItem key={vendor.id} value={vendor.id}>
          {vendor.name}
        </MenuItem>
      ))}
    </TextField>
  );
}
