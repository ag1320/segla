import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { formatCents, formatDate } from "../businessFormat";
import { TABLE_PAPER_SX, HEADER_CELL_SX, CELL_SX, MUTED_TEXT } from "../businessStyles";

const SUMMARY_CELL_SX = { ...CELL_SX, fontWeight: 700 };

const amountOrBlank = (cents) => (cents === 0 ? "" : formatCents(cents));

// One account's lines for the period, between its opening and closing
// balances. Balances are on the account's normal side.
export default function GeneralLedgerAccount({ account }) {
  return (
    <Paper sx={{ ...TABLE_PAPER_SX, mb: 3 }}>
      <Typography variant="subtitle1" color="white" sx={{ px: 2, py: 1, fontWeight: 600 }}>
        {`${account.accountNumber} ${account.name}`}
      </Typography>
      <TableContainer>
        <Table size="small" sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={HEADER_CELL_SX}>Date</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Memo</TableCell>
              <TableCell sx={HEADER_CELL_SX} align="right">Debit</TableCell>
              <TableCell sx={HEADER_CELL_SX} align="right">Credit</TableCell>
              <TableCell sx={HEADER_CELL_SX} align="right">Balance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={SUMMARY_CELL_SX} colSpan={4}>Opening balance</TableCell>
              <TableCell sx={SUMMARY_CELL_SX} align="right">{formatCents(account.openingBalanceCents)}</TableCell>
            </TableRow>
            {account.lines.map((line) => (
              <TableRow key={line.id}>
                <TableCell sx={{ ...CELL_SX, whiteSpace: "nowrap" }}>{formatDate(line.entryDate)}</TableCell>
                <TableCell sx={{ ...CELL_SX, color: line.memo ? "white" : MUTED_TEXT }}>
                  {line.memo || `Entry ${line.journalEntryId}`}
                </TableCell>
                <TableCell sx={CELL_SX} align="right">{amountOrBlank(line.debitCents)}</TableCell>
                <TableCell sx={CELL_SX} align="right">{amountOrBlank(line.creditCents)}</TableCell>
                <TableCell sx={CELL_SX} align="right">{formatCents(line.balanceCents)}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell sx={SUMMARY_CELL_SX} colSpan={4}>Closing balance</TableCell>
              <TableCell sx={SUMMARY_CELL_SX} align="right">{formatCents(account.closingBalanceCents)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
