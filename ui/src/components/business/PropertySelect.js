import { MenuItem, TextField } from "@mui/material";

// value is a property id, or "" for company-wide. displayEmpty makes the
// "" choice show its label instead of a blank box.
export default function PropertySelect({ value, properties, onChange, size = "small", sx }) {
  return (
    <TextField
      select
      size={size}
      label="Property"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      SelectProps={{ displayEmpty: true }}
      InputLabelProps={{ shrink: true }}
      sx={sx}
    >
      <MenuItem value="">Company-wide</MenuItem>
      {properties.map((property) => (
        <MenuItem key={property.id} value={property.id}>
          {property.name}
        </MenuItem>
      ))}
    </TextField>
  );
}
