import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableRow, TextField } from "@mui/material";
import { loadBusinessOperatingStatement } from "../../../state/businessReportsSlice";
import { loadBusinessProperties } from "../../../state/businessPropertiesSlice";
import PeriodFields from "./PeriodFields";
import ReportActions from "./ReportActions";
import PrintHeader from "./PrintHeader";
import OperatingKpis from "./OperatingKpis";
import { csvAmount } from "./reportCsv";
import { presetPeriod } from "./reportPeriods";
import { formatCents, formatDate } from "../businessFormat";
import { TABLE_PAPER_SX, CELL_SX, DARK_FIELD_SX, MUTED_TEXT } from "../businessStyles";

const BOLD_SX = { ...CELL_SX, fontWeight: 700 };
const SUBTOTAL_SX = { ...BOLD_SX, borderTop: "1px solid rgba(255,255,255,0.4)" };
const INDENT_SX = { ...CELL_SX, pl: 4, color: "rgba(255,255,255,0.85)" };

const defaultPeriod = () => ({ preset: "yearToDate", ...presetPeriod("yearToDate") });

// One property from gross potential rent down to cash flow, with its KPIs.
export default function OperatingStatement() {
  const dispatch = useDispatch();
  const statement = useSelector((state) => state.businessReports.operatingStatement);
  const properties = useSelector((state) => state.businessProperties.items);
  const [propertyId, setPropertyId] = useState("");
  const [period, setPeriod] = useState(defaultPeriod);

  useEffect(() => {
    const loadFirstRental = async () => {
      const loaded = await dispatch(loadBusinessProperties()).unwrap();
      const first = loaded.find((property) => property.status === "active") ?? loaded[0];
      if (first) {
        setPropertyId(first.id);
        const { from, to } = defaultPeriod();
        dispatch(loadBusinessOperatingStatement({ propertyId: first.id, from, to }));
      }
    };
    loadFirstRental();
  }, [dispatch]);

  const load = (nextPropertyId, nextPeriod) => {
    if (nextPropertyId && nextPeriod.from && nextPeriod.to) {
      dispatch(loadBusinessOperatingStatement({ propertyId: nextPropertyId, from: nextPeriod.from, to: nextPeriod.to }));
    }
  };
  const handleProperty = (event) => {
    setPropertyId(event.target.value);
    load(event.target.value, period);
  };
  const handlePeriod = (next) => {
    setPeriod(next);
    load(propertyId, next);
  };

  const isCurrent = statement && statement.propertyId === propertyId;
  const propertyName = properties.find((property) => property.id === propertyId)?.name ?? "";
  // [label, cents, sx]: shared by the table and the CSV.
  const lines = isCurrent
    ? [
        ["Gross potential rent", statement.grossPotentialRentCents, CELL_SX],
        ["Vacancy", -statement.vacancyCents, INDENT_SX],
        ["Rent not collected", -statement.uncollectedRentCents, INDENT_SX],
        ["Rent collected", statement.rentCollectedCents, SUBTOTAL_SX],
        ...statement.otherIncome.map((line) => [line.name, line.amountCents, INDENT_SX]),
        ["Effective gross income", statement.effectiveGrossIncomeCents, SUBTOTAL_SX],
        ...statement.operatingExpenses.map((line) => [line.name, -line.amountCents, INDENT_SX]),
        ["Net operating income", statement.noiCents, SUBTOTAL_SX],
        ["Mortgage interest", -statement.interestCents, INDENT_SX],
        ["Principal", -statement.principalCents, INDENT_SX],
        ["Cash flow", statement.cashFlowCents, SUBTOTAL_SX],
        ["Capital improvements", -statement.capexCents, INDENT_SX],
        ["Cash flow after capex", statement.cashFlowAfterCapexCents, SUBTOTAL_SX],
      ]
    : [];
  const subtitle = isCurrent ? `${propertyName} · ${formatDate(statement.from)} – ${formatDate(statement.to)}` : "";

  return (
    <>
      <Box className="no-print" sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, mb: 2 }}>
        <TextField select size="small" label="Property" value={propertyId} onChange={handleProperty} sx={{ ...DARK_FIELD_SX, minWidth: 200 }}>
          {properties.map((property) => (
            <MenuItem key={property.id} value={property.id}>
              {property.name}
            </MenuItem>
          ))}
        </TextField>
        <PeriodFields value={period} onChange={handlePeriod} />
        {isCurrent && (
          <ReportActions
            title="Operating Statement"
            subtitle={subtitle}
            fileName={`operating-statement_${statement.from}_${statement.to}.csv`}
            getCsvRows={() => [["Line", "Amount"], ...lines.map(([label, cents]) => [label, csvAmount(cents)])]}
          />
        )}
      </Box>
      {isCurrent && (
        <>
          <PrintHeader title="Operating Statement" subtitle={subtitle} />
          <OperatingKpis kpis={statement.kpis} />
          <Paper sx={{ ...TABLE_PAPER_SX, maxWidth: 640 }}>
            <TableContainer>
              <Table size="small">
                <TableBody>
                  {lines.map(([label, cents, sx]) => (
                    <TableRow key={label}>
                      <TableCell sx={sx}>{label}</TableCell>
                      <TableCell sx={{ ...sx, color: cents < 0 ? MUTED_TEXT : sx.color }} align="right">
                        {formatCents(cents)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </>
  );
}
