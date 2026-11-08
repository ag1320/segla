import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableRow } from "@mui/material";
import { loadBusinessOwnersEquity } from "../../../state/businessReportsSlice";
import PeriodFields from "./PeriodFields";
import ReportActions from "./ReportActions";
import PrintHeader from "./PrintHeader";
import { csvAmount } from "./reportCsv";
import { presetPeriod } from "./reportPeriods";
import { formatCents, formatDate } from "../businessFormat";
import { TABLE_PAPER_SX, CELL_SX } from "../businessStyles";

const BOLD_CELL_SX = { ...CELL_SX, fontWeight: 700 };
const ENDING_CELL_SX = { ...BOLD_CELL_SX, borderTop: "2px solid rgba(255,255,255,0.6)" };

const defaultPeriod = () => ({ preset: "yearToDate", ...presetPeriod("yearToDate") });

// How the owner's stake changed: starting equity, money put in and taken
// out, profit or loss, and ending equity (the balance sheet's total equity).
export default function OwnersEquity({ entityId }) {
  const dispatch = useDispatch();
  const statement = useSelector((state) => state.businessReports.ownersEquity);
  const [period, setPeriod] = useState(defaultPeriod);

  useEffect(() => {
    const { from, to } = defaultPeriod();
    dispatch(loadBusinessOwnersEquity({ entityId, from, to }));
  }, [dispatch, entityId]);

  const handlePeriod = (next) => {
    setPeriod(next);
    if (next.from && next.to) dispatch(loadBusinessOwnersEquity({ entityId, from: next.from, to: next.to }));
  };

  // [label, cents, sx] for each line, shared by the table and the CSV.
  const lines = statement
    ? [
        [`Owner's equity, ${formatDate(statement.from)}`, statement.openingEquityCents, BOLD_CELL_SX],
        ...statement.changes.map((change) => [`${change.accountNumber} ${change.name}`, change.amountCents, CELL_SX]),
        ["Net income", statement.netIncomeCents, CELL_SX],
        [`Owner's equity, ${formatDate(statement.to)}`, statement.closingEquityCents, ENDING_CELL_SX],
      ]
    : [];
  const subtitle = statement ? `${formatDate(statement.from)} – ${formatDate(statement.to)}` : "";

  return (
    <>
      <Box className="no-print" sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, mb: 2 }}>
        <PeriodFields value={period} onChange={handlePeriod} />
        {statement && (
          <ReportActions
            title="Statement of Owner's Equity"
            subtitle={subtitle}
            fileName={`owners-equity_${statement.from}_${statement.to}.csv`}
            getCsvRows={() => [["Line", "Amount"], ...lines.map(([label, cents]) => [label, csvAmount(cents)])]}
          />
        )}
      </Box>
      {statement && (
        <>
          <PrintHeader title="Statement of Owner's Equity" subtitle={subtitle} />
          <Paper sx={{ ...TABLE_PAPER_SX, maxWidth: 560 }}>
            <TableContainer>
              <Table size="small">
                <TableBody>
                  {lines.map(([label, cents, sx]) => (
                    <TableRow key={label}>
                      <TableCell sx={sx}>{label}</TableCell>
                      <TableCell sx={sx} align="right">{formatCents(cents)}</TableCell>
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
