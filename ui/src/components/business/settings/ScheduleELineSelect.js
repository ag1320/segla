import { MenuItem, TextField } from "@mui/material";

const SCHEDULE_E_LINES = [
  { line: 3, label: "Rents received", accountType: "income" },
  { line: 4, label: "Royalties received", accountType: "income" },
  { line: 5, label: "Advertising", accountType: "expense" },
  { line: 6, label: "Auto and travel", accountType: "expense" },
  { line: 7, label: "Cleaning and maintenance", accountType: "expense" },
  { line: 8, label: "Commissions", accountType: "expense" },
  { line: 9, label: "Insurance", accountType: "expense" },
  { line: 10, label: "Legal and other professional fees", accountType: "expense" },
  { line: 11, label: "Management fees", accountType: "expense" },
  { line: 12, label: "Mortgage interest paid to banks", accountType: "expense" },
  { line: 13, label: "Other interest", accountType: "expense" },
  { line: 14, label: "Repairs", accountType: "expense" },
  { line: 15, label: "Supplies", accountType: "expense" },
  { line: 16, label: "Taxes", accountType: "expense" },
  { line: 17, label: "Utilities", accountType: "expense" },
  { line: 18, label: "Depreciation expense or depletion", accountType: "expense" },
  { line: 19, label: "Other", accountType: "expense" },
];

// value is a line number or null (not on Schedule E).
export default function ScheduleELineSelect({ accountType, value, onChange }) {
  const lines = SCHEDULE_E_LINES.filter((line) => line.accountType === accountType);

  return (
    <TextField
      select
      label="Schedule E line"
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value === "" ? null : event.target.value)}
      disabled={lines.length === 0}
      helperText={lines.length === 0 ? "Only income and expense accounts go on Schedule E" : " "}
    >
      <MenuItem value="">None</MenuItem>
      {lines.map((line) => (
        <MenuItem key={line.line} value={line.line}>
          {`${line.line}. ${line.label}`}
        </MenuItem>
      ))}
    </TextField>
  );
}
