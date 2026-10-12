import { useState } from "react";
import { useSelector } from "react-redux";
import { withStyles } from "@mui/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AccountCard from "../AccountCard";
import ConfirmDeleteSnapshotDialog from "./ConfirmDeleteSnapshotDialog";
import { formatCurrency, formatSigned, formatDate, changeColor } from "./netWorthFormat";

const StyledTableCell = withStyles({
  root: {
    color: "white",
  },
})(TableCell);

const INITIAL_ROWS = 12;

const SOURCE_LABELS = {
  auto: "Account update",
  manual: "Manual",
  scheduled: "Monthly",
};

const columns = [
  { id: "icon", label: "", align: "center" },
  { id: "dateLabel", label: "Date", align: "left" },
  { id: "totalAssets", label: "Assets", align: "right", format: formatCurrency },
  { id: "totalLiabilities", label: "Liabilities", align: "right", format: formatCurrency },
  { id: "netWorth", label: "Net Worth", align: "right", format: formatCurrency },
  {
    id: "change",
    label: "Change",
    align: "right",
    format: (value) => (
      <span style={{ color: changeColor(value), fontWeight: 600 }}>{formatSigned(value)}</span>
    ),
  },
  { id: "sourceLabel", label: "Captured By", align: "right" },
];

export default function SnapshotHistory() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const snapshots = useSelector((state) => state.netWorth.snapshots);
  const [showAll, setShowAll] = useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [currentRow, setCurrentRow] = useState({});

  // Newest first, each row's change measured against the snapshot before it
  const rows = snapshots
    .map((s, i) => ({
      ...s,
      dateLabel: formatDate(s.date),
      sourceLabel: SOURCE_LABELS[s.source] || s.source,
      change: i > 0 ? s.netWorth - snapshots[i - 1].netWorth : null,
    }))
    .reverse();
  const visibleRows = showAll ? rows : rows.slice(0, INITIAL_ROWS);

  const handleDelete = (row) => {
    setCurrentRow(row);
    setOpenConfirmDelete(true);
  };

  if (rows.length === 0) return null;

  return (
    <>
      <ConfirmDeleteSnapshotDialog
        open={openConfirmDelete}
        setOpen={setOpenConfirmDelete}
        row={currentRow}
        setCurrentRow={setCurrentRow}
      />

      <Typography variant="h6" color="white" sx={{ mb: 1.5 }}>
        Snapshot History
      </Typography>

      {isMobile ? (
        visibleRows.map((row) => (
          <AccountCard
            key={row.id}
            row={row}
            columns={columns}
            actions={
              <IconButton size="small" onClick={() => handleDelete(row)} aria-label="delete snapshot">
                <DeleteIcon style={{ fill: "white" }} fontSize="small" />
              </IconButton>
            }
          />
        ))
      ) : (
        <Paper sx={{ width: "100%", overflow: "hidden", backgroundColor: "#1b262c" }}>
          <TableContainer sx={{ "& .MuiTableRow-root:hover": { backgroundColor: "#333" } }}>
            <Table size="small" sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <StyledTableCell
                      key={column.id}
                      align={column.align}
                      style={{ backgroundColor: "#0f4c75" }}
                    >
                      {column.label}
                    </StyledTableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleRows.map((row) => (
                  <TableRow hover key={row.id}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <StyledTableCell key={column.id} align={column.align}>
                          {column.id === "icon" ? (
                            <IconButton size="small" onClick={() => handleDelete(row)} aria-label="delete snapshot">
                              <DeleteIcon style={{ fill: "white" }} fontSize="small" />
                            </IconButton>
                          ) : column.format && typeof value === "number" ? (
                            column.format(value)
                          ) : value === null ? (
                            "—"
                          ) : (
                            value
                          )}
                        </StyledTableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {rows.length > INITIAL_ROWS && (
        <Box sx={{ textAlign: "center", mt: 1 }}>
          <Button onClick={() => setShowAll(!showAll)} sx={{ color: "#BBE1FA" }}>
            {showAll ? "Show Less" : `Show All (${rows.length})`}
          </Button>
        </Box>
      )}
    </>
  );
}
