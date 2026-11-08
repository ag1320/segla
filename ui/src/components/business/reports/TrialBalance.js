import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Chip,
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
import { loadBusinessTrialBalance } from "../../../state/businessReportsSlice";
import { formatCents, formatDate, todayDateString } from "../businessFormat";
import { TABLE_PAPER_SX, HEADER_CELL_SX, CELL_SX, DARK_FIELD_SX, MUTED_TEXT } from "../businessStyles";

const TOTAL_CELL_SX = { ...CELL_SX, fontWeight: 700, borderTop: "2px solid rgba(255,255,255,0.4)" };

const amountOrBlank = (cents) => (cents === 0 ? "" : formatCents(cents));

// Every account's balance on one date, split into debit and credit columns.
// The two totals are always equal when the books are sound.
export default function TrialBalance({ entityId }) {
  const dispatch = useDispatch();
  const trialBalance = useSelector((state) => state.businessReports.trialBalance);
  const [asOfDate, setAsOfDate] = useState(todayDateString());

  useEffect(() => {
    dispatch(loadBusinessTrialBalance({ entityId, asOfDate: todayDateString() }));
  }, [dispatch, entityId]);

  const handleDateChange = (event) => {
    setAsOfDate(event.target.value);
    if (event.target.value) {
      dispatch(loadBusinessTrialBalance({ entityId, asOfDate: event.target.value }));
    }
  };

  const isBalanced = trialBalance && trialBalance.totalDebitCents === trialBalance.totalCreditCents;

  return (
    <>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2 }}>
        <TextField
          label="As of"
          type="date"
          size="small"
          value={asOfDate}
          onChange={handleDateChange}
          InputLabelProps={{ shrink: true }}
          sx={DARK_FIELD_SX}
        />
        {trialBalance && (
          <Chip
            label={
              isBalanced
                ? "Balanced"
                : `Out of balance by ${formatCents(Math.abs(trialBalance.totalDebitCents - trialBalance.totalCreditCents))}`
            }
            color={isBalanced ? "success" : "error"}
          />
        )}
      </Box>

      {trialBalance && trialBalance.rows.length === 0 && (
        <Typography color={MUTED_TEXT}>{`No balances as of ${formatDate(trialBalance.asOfDate)}.`}</Typography>
      )}
      {trialBalance && trialBalance.rows.length > 0 && (
        <Paper sx={TABLE_PAPER_SX}>
          <TableContainer>
            <Table size="small" sx={{ minWidth: 560 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={HEADER_CELL_SX}>Number</TableCell>
                  <TableCell sx={HEADER_CELL_SX}>Account</TableCell>
                  <TableCell sx={HEADER_CELL_SX} align="right">Debit</TableCell>
                  <TableCell sx={HEADER_CELL_SX} align="right">Credit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trialBalance.rows.map((row) => (
                  <TableRow key={row.accountId}>
                    <TableCell sx={CELL_SX}>{row.accountNumber}</TableCell>
                    <TableCell sx={CELL_SX}>{row.name}</TableCell>
                    <TableCell sx={CELL_SX} align="right">{amountOrBlank(row.debitCents)}</TableCell>
                    <TableCell sx={CELL_SX} align="right">{amountOrBlank(row.creditCents)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell sx={TOTAL_CELL_SX} colSpan={2}>Total</TableCell>
                  <TableCell sx={TOTAL_CELL_SX} align="right">{formatCents(trialBalance.totalDebitCents)}</TableCell>
                  <TableCell sx={TOTAL_CELL_SX} align="right">{formatCents(trialBalance.totalCreditCents)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </>
  );
}
