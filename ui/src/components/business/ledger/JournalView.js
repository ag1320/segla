import { useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import JournalEntryRow from "./JournalEntryRow";
import { TABLE_PAPER_SX, TABLE_CONTAINER_SX, HEADER_CELL_SX } from "../businessStyles";

// Every entry, newest first, one row each until opened. An entry and the
// reversal that cancels it share one row, since together they add up to
// nothing.
export default function JournalView({ onReverse }) {
  const entries = useSelector((state) => state.businessJournalEntries.items);
  const [openIds, setOpenIds] = useState([]);

  const entriesById = Object.fromEntries(entries.map((entry) => [entry.id, entry]));
  const groups = [...entries]
    .reverse()
    .filter((entry) => entry.reversesId === null || !entriesById[entry.reversesId])
    .map((entry) => ({ entry, reversal: entriesById[entry.reversedById] ?? null }));

  const allOpen = openIds.length === groups.length;
  const toggleAll = () => setOpenIds(allOpen ? [] : groups.map((group) => group.entry.id));
  const toggle = (id) =>
    setOpenIds(openIds.includes(id) ? openIds.filter((openId) => openId !== id) : [...openIds, id]);

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
        <Button size="small" onClick={toggleAll} sx={{ color: "#BBE1FA" }}>
          {allOpen ? "Collapse all" : "Expand all"}
        </Button>
      </Box>
      <Paper sx={TABLE_PAPER_SX}>
        <TableContainer sx={TABLE_CONTAINER_SX}>
          <Table size="small" sx={{ minWidth: 860 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...HEADER_CELL_SX, width: 40 }} />
                <TableCell sx={HEADER_CELL_SX}>Date</TableCell>
                <TableCell sx={HEADER_CELL_SX}>Memo</TableCell>
                <TableCell sx={HEADER_CELL_SX}>Went to (debit)</TableCell>
                <TableCell sx={HEADER_CELL_SX}>Came from (credit)</TableCell>
                <TableCell sx={HEADER_CELL_SX} align="right">Amount</TableCell>
                <TableCell sx={HEADER_CELL_SX} />
              </TableRow>
            </TableHead>
            <TableBody>
              {groups.map((group) => (
                <JournalEntryRow
                  key={group.entry.id}
                  entry={group.entry}
                  reversal={group.reversal}
                  isOpen={openIds.includes(group.entry.id)}
                  onToggle={() => toggle(group.entry.id)}
                  onReverse={onReverse}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
}
