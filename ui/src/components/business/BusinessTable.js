import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AccountCard from "../AccountCard";
import { TABLE_PAPER_SX, TABLE_CONTAINER_SX, HEADER_CELL_SX, CELL_SX } from "./businessStyles";

// columns: [{ id, label, align }]; rows: display-ready objects with an id.
// On a phone each row becomes a card, like the account tables elsewhere.
export default function BusinessTable({ columns, rows, onEdit, isRowMuted = () => false }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const editButton = (row) => (
    <IconButton size="small" onClick={() => onEdit(row)} aria-label={`edit ${row.name}`}>
      <EditIcon sx={{ fill: "white" }} fontSize="small" />
    </IconButton>
  );

  if (isMobile) {
    return (
      <>
        {rows.map((row) => (
          <Box key={row.id} sx={{ opacity: isRowMuted(row) ? 0.5 : 1 }}>
            <AccountCard row={row} columns={columns} actions={editButton(row)} />
          </Box>
        ))}
      </>
    );
  }

  return (
    <Paper sx={TABLE_PAPER_SX}>
      <TableContainer sx={TABLE_CONTAINER_SX}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id} align={column.align} sx={HEADER_CELL_SX}>
                  {column.label}
                </TableCell>
              ))}
              <TableCell sx={HEADER_CELL_SX} />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow hover key={row.id} sx={{ opacity: isRowMuted(row) ? 0.5 : 1 }}>
                {columns.map((column) => (
                  <TableCell key={column.id} align={column.align} sx={CELL_SX}>
                    {row[column.id] ?? "—"}
                  </TableCell>
                ))}
                <TableCell align="right">{editButton(row)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
