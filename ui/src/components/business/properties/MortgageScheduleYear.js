import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { IconButton, TableCell, TableRow } from "@mui/material";
import { formatCents, formatDate } from "../businessFormat";
import { CELL_SX, MUTED_TEXT } from "../businessStyles";

const YEAR_CELL_SX = { ...CELL_SX, fontWeight: 600, cursor: "pointer" };
const MONTH_CELL_SX = { ...CELL_SX, color: "rgba(255,255,255,0.85)", backgroundColor: "rgba(255,255,255,0.03)" };

const sum = (rows, field) => rows.reduce((total, row) => total + row[field], 0);

// One calendar year of payments as a single row; opening it lists each
// month.
export default function MortgageScheduleYear({ year, rows, isOpen, onToggle }) {
  return (
    <>
      <TableRow hover onClick={onToggle}>
        <TableCell sx={YEAR_CELL_SX}>
          <IconButton size="small" aria-label={isOpen ? `collapse ${year}` : `expand ${year}`} sx={{ color: "white" }}>
            {isOpen ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowRightIcon fontSize="small" />}
          </IconButton>
          {year}
        </TableCell>
        <TableCell sx={{ ...YEAR_CELL_SX, color: MUTED_TEXT, fontWeight: 400 }}>{`${rows.length} payments`}</TableCell>
        <TableCell sx={YEAR_CELL_SX} align="right">{formatCents(sum(rows, "interestCents"))}</TableCell>
        <TableCell sx={YEAR_CELL_SX} align="right">{formatCents(sum(rows, "principalCents"))}</TableCell>
        <TableCell sx={YEAR_CELL_SX} align="right">{formatCents(sum(rows, "escrowCents"))}</TableCell>
        <TableCell sx={YEAR_CELL_SX} align="right">{formatCents(rows[rows.length - 1].balanceCents)}</TableCell>
      </TableRow>
      {isOpen &&
        rows.map((row) => (
          <TableRow key={row.number}>
            <TableCell sx={{ ...MONTH_CELL_SX, pl: 7 }}>{formatDate(row.dueDate)}</TableCell>
            <TableCell sx={{ ...MONTH_CELL_SX, color: MUTED_TEXT }}>{`#${row.number} · ${formatCents(row.totalCents)}`}</TableCell>
            <TableCell sx={MONTH_CELL_SX} align="right">{formatCents(row.interestCents)}</TableCell>
            <TableCell sx={MONTH_CELL_SX} align="right">{formatCents(row.principalCents)}</TableCell>
            <TableCell sx={MONTH_CELL_SX} align="right">{formatCents(row.escrowCents)}</TableCell>
            <TableCell sx={MONTH_CELL_SX} align="right">{formatCents(row.balanceCents)}</TableCell>
          </TableRow>
        ))}
    </>
  );
}
