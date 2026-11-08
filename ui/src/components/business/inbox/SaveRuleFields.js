import { Box, Checkbox, FormControlLabel, TextField } from "@mui/material";

// value: { isOn, descriptionPattern }
export default function SaveRuleFields({ value, disabled, onChange }) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
      <FormControlLabel
        label="Save as a rule"
        disabled={disabled}
        control={
          <Checkbox
            checked={value.isOn && !disabled}
            onChange={(event) => onChange({ ...value, isOn: event.target.checked })}
          />
        }
      />
      {value.isOn && !disabled && (
        <TextField
          size="small"
          label="When the description contains"
          value={value.descriptionPattern}
          onChange={(event) => onChange({ ...value, descriptionPattern: event.target.value })}
          helperText="Trim it to the part that repeats, e.g. HOME DEPOT"
          sx={{ flex: "1 1 300px" }}
        />
      )}
    </Box>
  );
}
