import { useState } from "react";
import { useSelector } from "react-redux";
import { Box, Paper, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { selectNetWorthTotals, getNetWorthChanges } from "../../utilities/helperFunctions";
import { NET_WORTH_CATEGORIES } from "./netWorthCategories";
import { formatCurrency, formatSigned, formatDate, changeColor } from "./netWorthFormat";
import { panelSx, toggleSx, mutedText } from "./netWorthStyles";

const PERIODS = [
  { id: "sinceLastMonth", label: "This Month" },
  { id: "yearToDate", label: "YTD" },
  { id: "allTime", label: "All Time" },
];

// Per-category explanation of the net worth change: live values vs. the
// same baseline snapshot NetWorthSummary's change stats use.
export default function WhatChanged() {
  const { breakdown, netWorth } = useSelector(selectNetWorthTotals);
  const snapshots = useSelector((state) => state.netWorth.snapshots);
  const [period, setPeriod] = useState("sinceLastMonth");

  const changes = getNetWorthChanges(snapshots, netWorth);
  const change = changes[period];

  let rows = [];
  let unchanged = [];
  if (change) {
    const all = NET_WORTH_CATEGORIES.map((cat) => {
      const current = breakdown[cat.key] || 0;
      const delta = current - (change.baseline[cat.key] || 0);
      // Paying a loan down is a *gain* to net worth
      const impact = cat.kind === "asset" ? delta : -delta;
      return { ...cat, current, delta, impact };
    });
    rows = all.filter((r) => Math.abs(r.impact) >= 0.5).sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
    unchanged = all.filter((r) => Math.abs(r.impact) < 0.5 && (r.current || r.delta));
  }
  const maxImpact = Math.max(1, ...rows.map((r) => Math.abs(r.impact)));

  return (
    <Paper sx={{ ...panelSx, height: "100%", boxSizing: "border-box" }}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h6">What Changed</Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={period}
          onChange={(e, value) => value && setPeriod(value)}
          sx={toggleSx}
        >
          {PERIODS.map((p) => (
            <ToggleButton key={p.id} value={p.id}>
              {p.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {!change ? (
        <Typography variant="body2" sx={{ color: mutedText, py: 3, textAlign: "center" }}>
          {period === "sinceLastMonth"
            ? "Needs a snapshot from a previous month to compare against. Check back next month."
            : "Needs at least one earlier snapshot to compare against."}
        </Typography>
      ) : (
        <>
          <Typography variant="body2" sx={{ color: mutedText, mb: 1.5 }}>
            {"Net worth "}
            <Box component="span" sx={{ color: changeColor(change.amount), fontWeight: 700 }}>
              {formatSigned(change.amount)}
            </Box>
            {` since ${formatDate(change.since)}`}
          </Typography>

          {rows.length === 0 && (
            <Typography variant="body2" sx={{ color: mutedText, py: 2, textAlign: "center" }}>
              Nothing has changed since then.
            </Typography>
          )}

          {rows.map((row, i) => (
            <Box
              key={row.key}
              sx={{
                py: 1,
                borderBottom: i < rows.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 2 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {row.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: mutedText }}>
                    {`${row.kind === "asset" ? "Now" : "Owed"} ${formatCurrency(row.current)}`}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: changeColor(row.impact), fontWeight: 700, whiteSpace: "nowrap" }}
                >
                  {formatSigned(row.impact)}
                </Typography>
              </Box>
              <Box sx={{ mt: 0.75, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.06)" }}>
                <Box
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    width: `${(Math.abs(row.impact) / maxImpact) * 100}%`,
                    backgroundColor: changeColor(row.impact),
                    opacity: 0.8,
                  }}
                />
              </Box>
            </Box>
          ))}

          {unchanged.length > 0 && (
            <Typography variant="caption" component="div" sx={{ color: mutedText, mt: 1.5 }}>
              {`Unchanged: ${unchanged.map((r) => r.label).join(", ")}`}
            </Typography>
          )}
        </>
      )}
    </Paper>
  );
}
