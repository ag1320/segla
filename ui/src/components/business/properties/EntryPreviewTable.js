import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import useLedgerLookups from "../ledger/useLedgerLookups";
import { formatCents } from "../businessFormat";

const TOTAL_CELL_SX = { fontWeight: 700, borderTop: "2px solid rgba(0,0,0,0.4)" };

// lines: [{ accountId, debitCents, creditCents }] of an entry not yet
// posted, for a wizard's review step.
export default function EntryPreviewTable({ lines }) {
  const { accountLabel } = useLedgerLookups();
  const debits = lines.reduce((sum, line) => sum + line.debitCents, 0);
  const credits = lines.reduce((sum, line) => sum + line.creditCents, 0);

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Account</TableCell>
          <TableCell align="right">Debit</TableCell>
          <TableCell align="right">Credit</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {lines.map((line) => (
          <TableRow key={`${line.accountId}-${line.debitCents > 0 ? "debit" : "credit"}`}>
            <TableCell>{accountLabel(line.accountId)}</TableCell>
            <TableCell align="right">{line.debitCents > 0 && formatCents(line.debitCents)}</TableCell>
            <TableCell align="right">{line.creditCents > 0 && formatCents(line.creditCents)}</TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell sx={TOTAL_CELL_SX}>Total</TableCell>
          <TableCell sx={TOTAL_CELL_SX} align="right">{formatCents(debits)}</TableCell>
          <TableCell sx={TOTAL_CELL_SX} align="right">{formatCents(credits)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
