import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import useLedgerLookups from "../ledger/useLedgerLookups";
import { formatCents } from "../businessFormat";

const TOTAL_CELL_SX = { fontWeight: 700, borderTop: "2px solid rgba(0,0,0,0.4)" };

// preview: what the conversion will post, from the server.
export default function ConversionReview({ preview }) {
  const { accountLabel } = useLedgerLookups();
  const total = preview.lines.reduce((sum, line) => sum + line.debitCents, 0);

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {`Basis: ${formatCents(preview.basisCents)}, the lower of what you have in the house and its market value (here, ${
          preview.basisSource === "adjusted_basis" ? "what you have in it" : "its market value"
        }). Land ${formatCents(preview.landCents)} is never depreciated; the building's ${formatCents(
          preview.buildingCents
        )} is, starting this month.`}
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Account</TableCell>
            <TableCell align="right">Debit</TableCell>
            <TableCell align="right">Credit</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {preview.lines.map((line) => (
            <TableRow key={line.accountId}>
              <TableCell>{accountLabel(line.accountId)}</TableCell>
              <TableCell align="right">{line.debitCents > 0 && formatCents(line.debitCents)}</TableCell>
              <TableCell align="right">{line.creditCents > 0 && formatCents(line.creditCents)}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell sx={TOTAL_CELL_SX}>Total</TableCell>
            <TableCell sx={TOTAL_CELL_SX} align="right">{formatCents(total)}</TableCell>
            <TableCell sx={TOTAL_CELL_SX} align="right">{formatCents(total)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Typography variant="body2" sx={{ mt: 1 }}>
        {preview.contributionCents >= 0
          ? `Your equity moving into the business: ${formatCents(preview.contributionCents)} (an owner contribution, not income).`
          : `You owe ${formatCents(-preview.contributionCents)} more than the basis, so this takes equity out of the business.`}
      </Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        Posting also marks the property an active rental and adds Land and Building fixed assets.
      </Typography>
    </Box>
  );
}
