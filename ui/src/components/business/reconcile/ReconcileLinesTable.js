import { Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { formatCents, formatDate } from "../businessFormat";

// lines: [{ id, entryDate, memo, amountCents }], amounts signed the way the
// statement shows them.
export default function ReconcileLinesTable({ lines, uncheckedIds, onToggle, onSetAll }) {
  if (lines.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No open transactions on or before this date.
      </Typography>
    );
  }

  const checkedCount = lines.length - uncheckedIds.length;

  return (
    <TableContainer sx={{ maxHeight: 360, border: 1, borderColor: "divider", borderRadius: 1 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                checked={checkedCount === lines.length}
                indeterminate={checkedCount > 0 && checkedCount < lines.length}
                onChange={(event) => onSetAll(event.target.checked)}
                inputProps={{ "aria-label": "check all" }}
              />
            </TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Memo</TableCell>
            <TableCell align="right">Amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lines.map((line) => (
            <TableRow hover key={line.id} onClick={() => onToggle(line.id)} sx={{ cursor: "pointer" }}>
              <TableCell padding="checkbox">
                <Checkbox checked={!uncheckedIds.includes(line.id)} inputProps={{ "aria-label": "on the statement" }} />
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(line.entryDate)}</TableCell>
              <TableCell>{line.memo}</TableCell>
              <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                {formatCents(line.amountCents)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
