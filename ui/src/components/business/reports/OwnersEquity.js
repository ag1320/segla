import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableRow } from "@mui/material";
import { loadBusinessOwnersEquity } from "../../../state/businessReportsSlice";
import PeriodFields from "./PeriodFields";
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

  const row = (label, cents, sx = CELL_SX) => (
    <TableRow key={label}>
      <TableCell sx={sx}>{label}</TableCell>
      <TableCell sx={sx} align="right">{formatCents(cents)}</TableCell>
    </TableRow>
  );

  return (
    <>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <PeriodFields value={period} onChange={handlePeriod} />
      </Box>
      {statement && (
        <Paper sx={{ ...TABLE_PAPER_SX, maxWidth: 560 }}>
          <TableContainer>
            <Table size="small">
              <TableBody>
                {row(`Owner's equity, ${formatDate(statement.from)}`, statement.openingEquityCents, BOLD_CELL_SX)}
                {statement.changes.map((change) => row(`${change.accountNumber} ${change.name}`, change.amountCents))}
                {row("Net income", statement.netIncomeCents)}
                {row(`Owner's equity, ${formatDate(statement.to)}`, statement.closingEquityCents, ENDING_CELL_SX)}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </>
  );
}
