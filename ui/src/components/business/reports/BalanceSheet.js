import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Chip, MenuItem, TextField } from "@mui/material";
import { loadBusinessBalanceSheet } from "../../../state/businessReportsSlice";
import StatementTable from "./StatementTable";
import { DATE_COMPARISONS, comparisonDate } from "./reportPeriods";
import { formatCents, formatDate, todayDateString } from "../businessFormat";
import { DARK_FIELD_SX } from "../businessStyles";

const toQuery = (entityId, { asOfDate, comparison }) => ({
  entityId,
  asOfDate,
  compareAsOfDate: comparisonDate(asOfDate, comparison),
});

// What the business owns (assets), owes (liabilities), and the owner's
// stake (equity) on one date. Assets always equal the other two combined.
export default function BalanceSheet({ entityId }) {
  const dispatch = useDispatch();
  const balanceSheet = useSelector((state) => state.businessReports.balanceSheet);
  const [settings, setSettings] = useState({ asOfDate: todayDateString(), comparison: "none" });

  useEffect(() => {
    dispatch(loadBusinessBalanceSheet(toQuery(entityId, { asOfDate: todayDateString(), comparison: "none" })));
  }, [dispatch, entityId]);

  const handleChange = (field) => (event) => {
    const next = { ...settings, [field]: event.target.value };
    setSettings(next);
    if (next.asOfDate) dispatch(loadBusinessBalanceSheet(toQuery(entityId, next)));
  };

  const difference = balanceSheet
    ? balanceSheet.assets.totalCents - balanceSheet.totalLiabilitiesAndEquityCents
    : 0;

  return (
    <>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          <TextField
            label="As of"
            type="date"
            size="small"
            value={settings.asOfDate}
            onChange={handleChange("asOfDate")}
            InputLabelProps={{ shrink: true }}
            sx={DARK_FIELD_SX}
          />
          <TextField
            select
            size="small"
            label="Compare to"
            value={settings.comparison}
            onChange={handleChange("comparison")}
            sx={{ ...DARK_FIELD_SX, minWidth: 200 }}
          >
            {Object.entries(DATE_COMPARISONS).map(([value, label]) => (
              <MenuItem key={value} value={value}>{label}</MenuItem>
            ))}
          </TextField>
        </Box>
        {balanceSheet && (
          <Chip
            label={difference === 0 ? "Balanced" : `Out of balance by ${formatCents(Math.abs(difference))}`}
            color={difference === 0 ? "success" : "error"}
          />
        )}
      </Box>

      {balanceSheet && (
        <StatementTable
          columnLabels={[
            formatDate(balanceSheet.asOfDate),
            ...(balanceSheet.compareAsOfDate ? [formatDate(balanceSheet.compareAsOfDate)] : []),
          ]}
          sections={[
            { title: "Assets", totalLabel: "Total assets", section: balanceSheet.assets },
            { title: "Liabilities", totalLabel: "Total liabilities", section: balanceSheet.liabilities },
            { title: "Equity", totalLabel: "Total equity", section: balanceSheet.equity },
          ]}
          summaryRows={[
            {
              label: "Total liabilities and equity",
              cents: balanceSheet.totalLiabilitiesAndEquityCents,
              compareCents: balanceSheet.compareTotalLiabilitiesAndEquityCents,
            },
          ]}
        />
      )}
    </>
  );
}
