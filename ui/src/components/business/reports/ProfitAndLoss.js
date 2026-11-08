import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, MenuItem, TextField } from "@mui/material";
import { loadBusinessProfitAndLoss } from "../../../state/businessReportsSlice";
import { loadBusinessProperties } from "../../../state/businessPropertiesSlice";
import StatementTable from "./StatementTable";
import { PERIOD_PRESETS, PERIOD_COMPARISONS, presetPeriod, comparisonPeriod } from "./reportPeriods";
import { formatDate } from "../businessFormat";
import { DARK_FIELD_SX } from "../businessStyles";

const FIELD_SX = { ...DARK_FIELD_SX, minWidth: 170 };

const defaultSettings = () => ({ preset: "yearToDate", ...presetPeriod("yearToDate"), comparison: "none", propertyId: "" });

function toQuery(entityId, settings) {
  return {
    entityId,
    from: settings.from,
    to: settings.to,
    ...comparisonPeriod(settings, settings.comparison),
    propertyId: settings.propertyId || undefined,
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

  const applySettings = (next) => {
    setSettings(next);
    if (next.from && next.to) dispatch(loadBusinessProfitAndLoss(toQuery(entityId, next)));
  };
  const handlePreset = (event) => {
    const preset = event.target.value;
    applySettings({ ...settings, preset, ...(preset === "custom" ? {} : presetPeriod(preset)) });
  };
  const handleChange = (field) => (event) =>
    applySettings({ ...settings, [field]: event.target.value, ...(field === "from" || field === "to" ? { preset: "custom" } : {}) });

  const columnLabels = profitAndLoss
    ? [
        periodLabel(profitAndLoss.from, profitAndLoss.to),
        ...(profitAndLoss.compareFrom ? [periodLabel(profitAndLoss.compareFrom, profitAndLoss.compareTo)] : []),
      ]
    : [];

  return (
    <>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <TextField select size="small" label="Period" value={settings.preset} onChange={handlePreset} sx={FIELD_SX}>
          {Object.entries(PERIOD_PRESETS).map(([value, label]) => (
            <MenuItem key={value} value={value}>{label}</MenuItem>
          ))}
        </TextField>
        <TextField label="From" type="date" size="small" value={settings.from} onChange={handleChange("from")} InputLabelProps={{ shrink: true }} sx={DARK_FIELD_SX} />
        <TextField label="To" type="date" size="small" value={settings.to} onChange={handleChange("to")} InputLabelProps={{ shrink: true }} sx={DARK_FIELD_SX} />
        <TextField select size="small" label="Compare to" value={settings.comparison} onChange={handleChange("comparison")} sx={FIELD_SX}>
          {Object.entries(PERIOD_COMPARISONS).map(([value, label]) => (
            <MenuItem key={value} value={value}>{label}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Property"
          value={settings.propertyId}
          onChange={handleChange("propertyId")}
          SelectProps={{ displayEmpty: true }}
          InputLabelProps={{ shrink: true }}
          sx={FIELD_SX}
        >
          <MenuItem value="">Whole business</MenuItem>
          {properties.map((property) => (
            <MenuItem key={property.id} value={property.id}>{property.name}</MenuItem>
          ))}
        </TextField>
      </Box>

      {profitAndLoss && (
        <StatementTable
          columnLabels={columnLabels}
          sections={[
            { title: "Income", totalLabel: "Total income", section: profitAndLoss.income },
            { title: "Expenses", totalLabel: "Total expenses", section: profitAndLoss.expenses },
          ]}
          summaryRows={[
            { label: "Net income", cents: profitAndLoss.netIncomeCents, compareCents: profitAndLoss.compareNetIncomeCents },
          ]}
        />
      )}
    </>
  );
}
