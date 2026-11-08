import { MenuItem, TextField } from "@mui/material";
import { PERIOD_PRESETS, presetPeriod } from "./reportPeriods";
import { DARK_FIELD_SX } from "../businessStyles";

// value: { preset, from, to }. Picking a preset fills in the dates; typing
// a date switches the preset to Custom.
export default function PeriodFields({ value, onChange }) {
  const handlePreset = (event) => {
    const preset = event.target.value;
    onChange({ preset, ...(preset === "custom" ? { from: value.from, to: value.to } : presetPeriod(preset)) });
  };
  const handleDate = (field) => (event) => onChange({ ...value, preset: "custom", [field]: event.target.value });

  return (
    <>
      <TextField
        select
        size="small"
        label="Period"
        value={value.preset}
        onChange={handlePreset}
        sx={{ ...DARK_FIELD_SX, minWidth: 170 }}
      >
        {Object.entries(PERIOD_PRESETS).map(([preset, label]) => (
          <MenuItem key={preset} value={preset}>{label}</MenuItem>
        ))}
      </TextField>
      <TextField
        label="From"
        type="date"
        size="small"
        value={value.from}
        onChange={handleDate("from")}
        InputLabelProps={{ shrink: true }}
        sx={DARK_FIELD_SX}
      />
      <TextField
        label="To"
        type="date"
        size="small"
        value={value.to}
        onChange={handleDate("to")}
        InputLabelProps={{ shrink: true }}
        sx={DARK_FIELD_SX}
      />
    </>
  );
}
