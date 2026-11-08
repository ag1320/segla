import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { Box, Collapse, IconButton, TableCell, TableRow } from "@mui/material";
import EntryActions from "./EntryActions";
import JournalLines from "./JournalLines";
import useLedgerLookups from "./useLedgerLookups";
import { formatCents, formatDate } from "../businessFormat";
import { CELL_SX, MUTED_TEXT } from "../businessStyles";

const SUMMARY_CELL_SX = { ...CELL_SX, borderBottom: "1px solid rgba(255,255,255,0.12)", cursor: "pointer" };

// reversal is the entry that cancels this one, or null. A reversed pair is
// dimmed and its amount struck through: together the two change nothing.
export default function JournalEntryRow({ entry, reversal, isOpen, onToggle, onReverse }) {
  const { accountLabel } = useLedgerLookups();

  const sideLabel = (side) => {
    const accountIds = [...new Set(entry.lines.filter((line) => line[side] > 0).map((line) => line.accountId))];
    return accountIds.length === 1 ? accountLabel(accountIds[0]) : `${accountIds.length} accounts`;
  };
  const amountCents = entry.lines.reduce((total, line) => total + line.debitCents, 0);
  const isCancelled = reversal !== null;
  const cellSx = { ...SUMMARY_CELL_SX, opacity: isCancelled ? 0.55 : 1 };

  return (
    <>
      <TableRow hover onClick={onToggle}>
        <TableCell sx={cellSx}>
          <IconButton size="small" aria-label={isOpen ? "collapse entry" : "expand entry"} sx={{ color: "white" }}>
            {isOpen ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowRightIcon fontSize="small" />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ ...cellSx, whiteSpace: "nowrap" }}>{formatDate(entry.entryDate)}</TableCell>
        <TableCell sx={cellSx}>
          {entry.memo || <Box component="span" sx={{ color: MUTED_TEXT }}>{`Entry #${entry.id}`}</Box>}
        </TableCell>
        <TableCell sx={cellSx}>{sideLabel("debitCents")}</TableCell>
        <TableCell sx={cellSx}>{sideLabel("creditCents")}</TableCell>
        <TableCell
          sx={{ ...cellSx, textDecoration: isCancelled ? "line-through" : "none", whiteSpace: "nowrap" }}
          align="right"
        >
          {formatCents(amountCents)}
        </TableCell>
        <TableCell sx={{ ...SUMMARY_CELL_SX, cursor: "default" }} onClick={(event) => event.stopPropagation()}>
          <EntryActions entry={entry} onReverse={onReverse} />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={7} sx={{ p: 0, borderBottom: isOpen ? "1px solid rgba(255,255,255,0.12)" : "none" }}>
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <Box sx={{ pl: 7, pr: 2, py: 1, backgroundColor: "rgba(255,255,255,0.03)" }}>
              <JournalLines entry={entry} title={reversal ? `#${entry.id} · original` : null} />
              {reversal && (
                <JournalLines
                  entry={reversal}
                  title={`#${reversal.id} · reversal on ${formatDate(reversal.entryDate)}`}
                />
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
