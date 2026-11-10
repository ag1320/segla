import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { loadBusinessScheduleE } from "../../../state/businessReportsSlice";
import ReportActions from "./ReportActions";
import PrintHeader from "./PrintHeader";
import { csvAmount } from "./reportCsv";
import { formatCents } from "../businessFormat";
import { TABLE_PAPER_SX, HEADER_CELL_SX, CELL_SX, DARK_FIELD_SX, MUTED_TEXT } from "../businessStyles";

const ALLOCATIONS = {
  equal: "Equal shares",
  rent: "By rent",
  days_in_service: "By days in service",
};

// Why an amount is listed under the table instead of in it.
const LEFT_OFF_REASONS = { no_line: "no Schedule E line", not_in_service: "not in service" };

const describeLeftOff = (item) =>
  `${item.accountNumber} ${item.name}${item.propertyName ? ` · ${item.propertyName}` : ""} (${LEFT_OFF_REASONS[item.reason]})`;

const BOLD_SX = { ...CELL_SX, fontWeight: 700, borderTop: "2px solid rgba(255,255,255,0.4)" };
const lastYear = () => new Date().getFullYear() - 1;

// The tax year as the CPA needs it for Schedule E: one column per
// property, company-wide costs split by the chosen method.
export default function ScheduleE({ entityId }) {
  const dispatch = useDispatch();
  const scheduleE = useSelector((state) => state.businessReports.scheduleE);
  const [settings, setSettings] = useState({ taxYear: lastYear(), allocation: "equal" });

  useEffect(() => {
    dispatch(loadBusinessScheduleE({ entityId, taxYear: lastYear(), allocation: "equal" }));
  }, [dispatch, entityId]);

  const change = (field) => (event) => {
    const next = { ...settings, [field]: event.target.value };
    setSettings(next);
    dispatch(loadBusinessScheduleE({ entityId, ...next }));
  };

  if (!scheduleE) return null;

  const total = (amounts) => amounts.reduce((sum, amount) => sum + amount, 0);
  // [key, line, label, amounts, sx]: shared by the table and the CSV.
  const rows = [
    ...scheduleE.lines.map((line) => [`line-${line.line}`, line.line, line.label, line.amounts, CELL_SX]),
    ["total-expenses", 20, "Total expenses", scheduleE.totalExpenses, BOLD_SX],
    ["income-or-loss", 21, "Income or (loss)", scheduleE.incomeOrLoss, BOLD_SX],
  ];
  const subtitle = `${scheduleE.taxYear} · company-wide costs ${
    scheduleE.allocation ? ALLOCATIONS[scheduleE.allocation].toLowerCase() : "not allocated"
  }`;
  const csvRows = () => [
    ["Line", "Description", ...scheduleE.columns.map((column) => column.name), "Total"],
    ["2", "Fair rental days", ...scheduleE.columns.map((column) => column.fairRentalDays), ""],
    ...rows.map(([, line, label, amounts]) => [line, label, ...amounts.map(csvAmount), csvAmount(total(amounts))]),
    ...scheduleE.notOnScheduleE.map((item) => ["", `Not on Schedule E: ${describeLeftOff(item)}`, csvAmount(item.amountCents)]),
  ];

  return (
    <>
      <Box className="no-print" sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, mb: 2 }}>
        <TextField select size="small" label="Tax year" value={settings.taxYear} onChange={change("taxYear")} sx={{ ...DARK_FIELD_SX, minWidth: 120 }}>
          {[0, 1, 2, 3].map((back) => (
            <MenuItem key={back} value={lastYear() + 1 - back}>{lastYear() + 1 - back}</MenuItem>
          ))}
        </TextField>
        <TextField select size="small" label="Company-wide costs" value={settings.allocation} onChange={change("allocation")} sx={{ ...DARK_FIELD_SX, minWidth: 200 }}>
          {Object.entries(ALLOCATIONS).map(([value, label]) => (
            <MenuItem key={value} value={value}>{label}</MenuItem>
          ))}
        </TextField>
        <ReportActions title="Schedule E Summary" subtitle={subtitle} fileName={`schedule-e_${scheduleE.taxYear}.csv`} getCsvRows={csvRows} />
      </Box>
      <PrintHeader title="Schedule E Summary" subtitle={subtitle} />
      {scheduleE.columns.length === 0 ? (
        <Typography color={MUTED_TEXT}>{`No rental activity in ${scheduleE.taxYear}.`}</Typography>
      ) : (
        <Paper sx={TABLE_PAPER_SX}>
          <TableContainer>
            <Table size="small" sx={{ minWidth: 640 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={HEADER_CELL_SX}>Line</TableCell>
                  <TableCell sx={HEADER_CELL_SX} />
                  {scheduleE.columns.map((column) => (
                    <TableCell key={column.name} sx={HEADER_CELL_SX} align="right">{column.name}</TableCell>
                  ))}
                  <TableCell sx={HEADER_CELL_SX} align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={CELL_SX}>2</TableCell>
                  <TableCell sx={CELL_SX}>Fair rental days</TableCell>
                  {scheduleE.columns.map((column) => (
                    <TableCell key={column.name} sx={CELL_SX} align="right">{column.fairRentalDays}</TableCell>
                  ))}
                  <TableCell sx={CELL_SX} />
                </TableRow>
                {rows.map(([key, line, label, amounts, sx]) => (
                  <TableRow key={key}>
                    <TableCell sx={sx}>{line}</TableCell>
                    <TableCell sx={sx}>{label}</TableCell>
                    {amounts.map((amount, index) => (
                      <TableCell key={scheduleE.columns[index].name} sx={{ ...sx, color: amount === 0 ? MUTED_TEXT : sx.color }} align="right">
                        {formatCents(amount)}
                      </TableCell>
                    ))}
                    <TableCell sx={sx} align="right">{formatCents(total(amounts))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      {scheduleE.notOnScheduleE.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="white">Not on Schedule E</Typography>
          {scheduleE.notOnScheduleE.map((item) => (
            <Typography key={`${item.accountId}-${item.propertyId}`} variant="body2" color={MUTED_TEXT}>
              {`${describeLeftOff(item)}: ${formatCents(item.amountCents)}`}
            </Typography>
          ))}
        </Box>
      )}
    </>
  );
}
