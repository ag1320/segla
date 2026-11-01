import { useSelector } from "react-redux";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import EntryActions from "./EntryActions";
import useLedgerLookups from "./useLedgerLookups";
import { formatCents, formatDate } from "../businessFormat";
import { TABLE_PAPER_SX, TABLE_CONTAINER_SX, HEADER_CELL_SX, CELL_SX } from "../businessStyles";

// These grow with credits; the rest (assets, expenses) grow with debits.
// Showing each balance on its normal side keeps it positive.
const CREDIT_NORMAL_TYPES = ["contra_asset", "liability", "equity", "income"];

// One account's lines, newest first, with the balance after each line.
export default function AccountRegister({ accountId, onReverse }) {
  const entries = useSelector((state) => state.businessJournalEntries.items);
  const { accountsById, accountLabel } = useLedgerLookups();
  const isCreditNormal = CREDIT_NORMAL_TYPES.includes(accountsById[accountId]?.type);

  // Entries arrive oldest first, so the running balance builds in order.
  let balance = 0;
  const rows = entries.flatMap((entry) =>
    entry.lines
      .filter((line) => line.accountId === accountId)
      .map((line) => {
        const change = line.debitCents - line.creditCents;
        balance += isCreditNormal ? -change : change;
        const otherAccounts = entry.lines
          .filter((other) => other.accountId !== accountId)
          .map((other) => accountLabel(other.accountId));
        return { line, entry, balance, otherAccounts: [...new Set(otherAccounts)].join(", ") };
      })
  );

  return (
    <Paper sx={TABLE_PAPER_SX}>
      <TableContainer sx={TABLE_CONTAINER_SX}>
        <Table size="small" sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={HEADER_CELL_SX}>Date</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Entry</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Other Account</TableCell>
              <TableCell sx={HEADER_CELL_SX} align="right">Debit</TableCell>
              <TableCell sx={HEADER_CELL_SX} align="right">Credit</TableCell>
              <TableCell sx={HEADER_CELL_SX} align="right">Balance</TableCell>
              <TableCell sx={HEADER_CELL_SX} />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.reverse().map(({ line, entry, balance: balanceAfter, otherAccounts }) => (
              <TableRow hover key={line.id}>
                <TableCell sx={CELL_SX}>{formatDate(entry.entryDate)}</TableCell>
                <TableCell sx={CELL_SX}>
                  {`#${entry.id}`}
                  {entry.memo && ` · ${entry.memo}`}
                </TableCell>
                <TableCell sx={CELL_SX}>{otherAccounts}</TableCell>
                <TableCell sx={CELL_SX} align="right">
                  {line.debitCents > 0 && formatCents(line.debitCents)}
                </TableCell>
                <TableCell sx={CELL_SX} align="right">
                  {line.creditCents > 0 && formatCents(line.creditCents)}
                </TableCell>
                <TableCell sx={{ ...CELL_SX, fontWeight: 600 }} align="right">
                  {formatCents(balanceAfter)}
                </TableCell>
                <TableCell sx={CELL_SX}>
                  <EntryActions entry={entry} onReverse={onReverse} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
