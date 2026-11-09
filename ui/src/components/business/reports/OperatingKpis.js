import { Box } from "@mui/material";
import PropertyTile from "../properties/PropertyTile";

const percent = (value) => (value === null ? "—" : `${(value * 100).toFixed(1)}%`);
const times = (value) => (value === null ? "—" : `${value.toFixed(2)}×`);

// kpis: ratios from the operating statement; null when there's nothing to
// divide by yet.
export default function OperatingKpis({ kpis }) {
  const tiles = [
    ["Occupancy", percent(kpis.physicalOccupancy), "Days leased", "Share of in-service days with a tenant"],
    ["Economic occupancy", percent(kpis.economicOccupancy), "Rent collected ÷ GPR", "Vacancy and unpaid rent both lower it"],
    ["Expense ratio", percent(kpis.expenseRatio), "OpEx ÷ EGI", "Operating expenses as a share of income"],
    ["DSCR", times(kpis.dscr), "NOI ÷ debt service", "Above 1.25× is what lenders look for"],
    ["Cap rate", percent(kpis.capRate), "NOI ÷ value, yearly", "Uses the latest valuation"],
  ];

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
      {tiles.map(([label, value, caption, tooltip]) => (
        <PropertyTile key={label} label={label} value={value} caption={caption} tooltip={tooltip} />
      ))}
    </Box>
  );
}
