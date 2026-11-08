import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, MenuItem, TextField } from "@mui/material";
import { loadBusinessProfitAndLoss } from "../../../state/businessReportsSlice";
import { loadBusinessProperties } from "../../../state/businessPropertiesSlice";
import StatementTable from "./StatementTable";
import PeriodFields from "./PeriodFields";
import ReportActions from "./ReportActions";
import PrintHeader from "./PrintHeader";
import { statementCsvRows } from "./reportCsv";
import { PERIOD_COMPARISONS, presetPeriod, comparisonPeriod } from "./reportPeriods";
import { formatDate } from "../businessFormat";
import { DARK_FIELD_SX } from "../businessStyles";

const FIELD_SX = { ...DARK_FIELD_SX, minWidth: 170 };

const defaultSettings = () => ({
  period: { preset: "yearToDate", ...presetPeriod("yearToDate") },
  comparison: "none",
  propertyId: "",
});

function toQuery(entityId, { period, comparison, propertyId }) {
  return {
    entityId,
    from: period.from,
    to: period.to,
    ...comparisonPeriod(period, comparison),
    propertyId: propertyId || undefined,
  };
}

const periodLabel = (from, to) => `${formatDate(from)} – ${formatDate(to)}`;

// Income minus expenses for a period: whether the business made money.
export default function ProfitAndLoss({ entityId }) {
  const dispatch = useDispatch();
  const profitAndLoss = useSelector((state) => state.businessReports.profitAndLoss);
  const properties = useSelector((state) => state.businessProperties.items);
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    dispatch(loadBusinessProperties());
    dispatch(loadBusinessProfitAndLoss(toQuery(entityId, defaultSettings())));
  }, [dispatch, entityId]);

  const applySettings = (changes) => {
    const next = { ...settings, ...changes };
    setSettings(next);
    if (next.period.from && next.period.to) dispatch(loadBusinessProfitAndLoss(toQuery(entityId, next)));
  };

  const statement = profitAndLoss && {
    columnLabels: [
      periodLabel(profitAndLoss.from, profitAndLoss.to),
      ...(profitAndLoss.compareFrom ? [periodLabel(profitAndLoss.compareFrom, profitAndLoss.compareTo)] : []),
    ],
    sections: [
      { title: "Income", totalLabel: "Total income", section: profitAndLoss.income },
      { title: "Expenses", totalLabel: "Total expenses", section: profitAndLoss.expenses },
    ],
    summaryRows: [
      { label: "Net income", cents: profitAndLoss.netIncomeCents, compareCents: profitAndLoss.compareNetIncomeCents },
    ],
  };
  const propertyName = properties.find((property) => property.id === settings.propertyId)?.name ?? "Whole business";
  const subtitle = statement ? `${statement.columnLabels.join(" vs. ")} · ${propertyName}` : "";

  return (
    <>
      <Box className="no-print" sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <PeriodFields value={settings.period} onChange={(period) => applySettings({ period })} />
        <TextField
          select
          size="small"
          label="Compare to"
          value={settings.comparison}
          onChange={(event) => applySettings({ comparison: event.target.value })}
          sx={FIELD_SX}
        >
          {Object.entries(PERIOD_COMPARISONS).map(([value, label]) => (
            <MenuItem key={value} value={value}>{label}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Property"
          value={settings.propertyId}
          onChange={(event) => applySettings({ propertyId: event.target.value })}
          SelectProps={{ displayEmpty: true }}
          InputLabelProps={{ shrink: true }}
          sx={FIELD_SX}
        >
          <MenuItem value="">Whole business</MenuItem>
          {properties.map((property) => (
            <MenuItem key={property.id} value={property.id}>{property.name}</MenuItem>
          ))}
        </TextField>
        {statement && (
          <ReportActions
            title="Profit & Loss"
            subtitle={subtitle}
            fileName={`profit-and-loss_${profitAndLoss.from}_${profitAndLoss.to}.csv`}
            getCsvRows={() => statementCsvRows(statement)}
          />
        )}
      </Box>

      {statement && (
        <>
          <PrintHeader title="Profit & Loss" subtitle={subtitle} />
          <StatementTable {...statement} />
        </>
      )}
    </>
  );
}
