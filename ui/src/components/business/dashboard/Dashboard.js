import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography } from "@mui/material";
import { loadBusinessDashboard } from "../../../state/businessDashboardSlice";
import PropertyTile from "../properties/PropertyTile";
import DashboardAlerts from "./DashboardAlerts";
import { formatCents } from "../businessFormat";
import { MUTED_TEXT } from "../businessStyles";

const TILES_SX = { display: "flex", flexWrap: "wrap", gap: 2, mb: 2 };
const percent = (value) => (value === null ? "—" : `${(value * 100).toFixed(0)}%`);

// The business at a glance. Before any property is in service it tracks
// the money going in; after, how the rentals are doing.
export default function Dashboard() {
  const dispatch = useDispatch();
  const dashboard = useSelector((state) => state.businessDashboard.data);

  useEffect(() => {
    dispatch(loadBusinessDashboard());
  }, [dispatch]);

  if (!dashboard) {
    return <Typography color={MUTED_TEXT}>Loading…</Typography>;
  }

  const tiles =
    dashboard.phase === "operating"
      ? [
          ["NOI this year", formatCents(dashboard.operating.noiYtdCents), "Before the mortgage"],
          ["Cash flow this month", formatCents(dashboard.operating.cashFlowThisMonthCents), "After the mortgage"],
          ["Occupancy", percent(dashboard.operating.occupancy), "This month"],
          ["DSCR", dashboard.operating.dscr === null ? "—" : `${dashboard.operating.dscr.toFixed(2)}×`, "This year"],
          ["CapEx reserve", percent(dashboard.operating.capexFundedRatio), "Funded"],
        ]
      : [
          ["Contributed", formatCents(dashboard.contributedCents), "From you, to date"],
          ["Spent", formatCents(dashboard.spentCents), "Expenses and startup costs"],
          [
            "Until conversion",
            dashboard.daysToConversion === null ? "—" : `${dashboard.daysToConversion} days`,
            "Target date",
          ],
        ];

  return (
    <>
      <Box sx={TILES_SX}>
        <PropertyTile label="Cash" value={formatCents(dashboard.cashCents)} caption="In the bank" />
        <PropertyTile label="Card" value={formatCents(dashboard.cardOwedCents)} caption="Owed" />
        <PropertyTile label="Worth" value={formatCents(dashboard.marketEquityCents)} caption="At market value" />
      </Box>
      <Box sx={TILES_SX}>
        {tiles.map(([label, value, caption]) => (
          <PropertyTile key={label} label={label} value={value} caption={caption} />
        ))}
      </Box>
      <DashboardAlerts alerts={dashboard.alerts} />
    </>
  );
}
