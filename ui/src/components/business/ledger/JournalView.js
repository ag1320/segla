import { Fragment } from "react";
import { useSelector } from "react-redux";
import FlagIcon from "@mui/icons-material/Flag";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import EntryActions from "./EntryActions";
import useLedgerLookups from "./useLedgerLookups";
import { formatCents, formatDate } from "../businessFormat";
import {
  TABLE_PAPER_SX,
  TABLE_CONTAINER_SX,
  HEADER_CELL_SX,
  CELL_SX,
  MUTED_TEXT,
} from "../businessStyles";

const ENTRY_ROW_SX = { ...CELL_SX, borderBottom: "none", pt: 1.5, fontWeight: 600 };
const LINE_CELL_SX = { ...CELL_SX, pl: 4 };

// Every entry with all of its lines, newest first.
export default function JournalView({ onReverse }) {
  const entries = useSelector((state) => state.businessJournalEntries.items);
  const { accountLabel, propertyLabel } = useLedgerLookups();
  const newestFirst = [...entries].reverse();

  return (
    <Paper sx={TABLE_PAPER_SX}>
      <TableContainer sx={TABLE_CONTAINER_SX}>
        <Table size="small" sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={HEADER_CELL_SX}>Date</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Account</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Property</TableCell>
              <TableCell sx={HEADER_CELL_SX} align="right">Debit</TableCell>
              <TableCell sx={HEADER_CELL_SX} align="right">Credit</TableCell>
              <TableCell sx={HEADER_CELL_SX} />
            </TableRow>
          </TableHead>
          <TableBody>
            {newestFirst.map((entry) => (
              <Fragment key={entry.id}>
                <TableRow>
                  <TableCell sx={ENTRY_ROW_SX}>{formatDate(entry.entryDate)}</TableCell>
                  <TableCell sx={ENTRY_ROW_SX} colSpan={4}>
                    {`#${entry.id}`}
                    {entry.memo && <span style={{ fontWeight: 400 }}>{` · ${entry.memo}`}</span>}
                  </TableCell>
                  <TableCell sx={{ ...ENTRY_ROW_SX, fontWeight: 400 }}>
                    <EntryActions entry={entry} onReverse={onReverse} />
                  </TableCell>
                </TableRow>
                {entry.lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell sx={CELL_SX} />
                    <TableCell sx={LINE_CELL_SX}>
                      {accountLabel(line.accountId)}
                      {line.needsCpaReview && (
                        <Tooltip title="Flagged for CPA review">
                          <FlagIcon fontSize="inherit" sx={{ ml: 1, color: "#f9a825", verticalAlign: "middle" }} />
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell sx={{ ...CELL_SX, color: line.propertyId === null ? MUTED_TEXT : "white" }}>
                      {propertyLabel(line.propertyId)}
                    </TableCell>
                    <TableCell sx={CELL_SX} align="right">
                      {line.debitCents > 0 && formatCents(line.debitCents)}
                    </TableCell>
                    <TableCell sx={CELL_SX} align="right">
                      {line.creditCents > 0 && formatCents(line.creditCents)}
                    </TableCell>
                    <TableCell sx={CELL_SX} />
                  </TableRow>
                ))}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
