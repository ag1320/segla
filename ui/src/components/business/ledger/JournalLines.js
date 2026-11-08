import FlagIcon from "@mui/icons-material/Flag";
import { Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import useLedgerLookups from "./useLedgerLookups";
import { formatCents } from "../businessFormat";
import { CELL_SX, MUTED_TEXT } from "../businessStyles";

const LINE_CELL_SX = { ...CELL_SX, borderBottom: "1px solid rgba(255,255,255,0.06)" };
const LINE_HEADER_SX = { ...LINE_CELL_SX, color: MUTED_TEXT, fontSize: "0.75rem" };

// One entry's lines. title labels it when two entries are shown together.
export default function JournalLines({ entry, title }) {
  const { accountLabel, propertyLabel } = useLedgerLookups();

  return (
    <>
      {title && (
        <Typography variant="caption" sx={{ color: MUTED_TEXT, display: "block", mt: 1 }}>
          {title}
        </Typography>
      )}
      <Table size="small" sx={{ mb: 1 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={LINE_HEADER_SX}>Account</TableCell>
            <TableCell sx={LINE_HEADER_SX}>Property</TableCell>
            <TableCell sx={LINE_HEADER_SX} align="right">Debit</TableCell>
            <TableCell sx={LINE_HEADER_SX} align="right">Credit</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entry.lines.map((line) => (
            <TableRow key={line.id}>
              <TableCell sx={LINE_CELL_SX}>
                {accountLabel(line.accountId)}
                {line.needsCpaReview && (
                  <Tooltip title="Flagged for CPA review">
                    <FlagIcon fontSize="inherit" sx={{ ml: 1, color: "#f9a825", verticalAlign: "middle" }} />
                  </Tooltip>
                )}
              </TableCell>
              <TableCell sx={{ ...LINE_CELL_SX, color: line.propertyId === null ? MUTED_TEXT : "white" }}>
                {propertyLabel(line.propertyId)}
              </TableCell>
              <TableCell sx={LINE_CELL_SX} align="right">
                {line.debitCents > 0 && formatCents(line.debitCents)}
              </TableCell>
              <TableCell sx={LINE_CELL_SX} align="right">
                {line.creditCents > 0 && formatCents(line.creditCents)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
