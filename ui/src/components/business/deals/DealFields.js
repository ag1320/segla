import { Box, InputAdornment, TextField, Typography } from "@mui/material";
import { DEAL_FIELD_GROUPS } from "./dealForm";

const GRID_SX = { display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 1.5 };

const adornment = (kind) =>
  kind === "dollars"
    ? { startAdornment: <InputAdornment position="start">$</InputAdornment> }
    : { endAdornment: <InputAdornment position="end">{kind === "years" ? "yrs" : "%"}</InputAdornment> };

// value: the form's text fields, by name.
export default function DealFields({ value, onChange }) {
  const handleChange = (field) => (event) => onChange({ ...value, [field]: event.target.value });

  return (
    <>
      {DEAL_FIELD_GROUPS.map(([title, fields]) => (
        <Box key={title}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {title}
          </Typography>
          <Box sx={GRID_SX}>
            {fields.map(([field, label, kind, helper]) => (
              <TextField
                key={field}
                size="small"
                label={label}
                value={value[field]}
                onChange={handleChange(field)}
                InputProps={adornment(kind)}
                inputProps={{ inputMode: "decimal" }}
                helperText={helper}
              />
            ))}
          </Box>
        </Box>
      ))}
    </>
  );
}
