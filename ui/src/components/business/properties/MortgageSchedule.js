import { useState } from "react";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material";
import MortgageScheduleYear from "./MortgageScheduleYear";
import { todayDateString } from "../businessFormat";
import { TABLE_PAPER_SX, TABLE_CONTAINER_SX, HEADER_CELL_SX } from "../businessStyles";

// The whole amortization schedule, a row per year, this year opened.
export default function MortgageSchedule({ rows }) {
  const thisYear = todayDateString().slice(0, 4);
  const [openYears, setOpenYears] = useState([thisYear]);

  const years = [...new Set(rows.map((row) => row.dueDate.slice(0, 4)))];
  const toggle = (year) =>
    setOpenYears(openYears.includes(year) ? openYears.filter((open) => open !== year) : [...openYears, year]);

  return (
    <Paper sx={TABLE_PAPER_SX}>
      <TableContainer sx={TABLE_CONTAINER_SX}>
        <Table size="small" sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={HEADER_CELL_SX}>Year</TableCell>
              <TableCell sx={HEADER_CELL_SX} />
              <Tooltip title="Each year's interest should match the lender's Form 1098" placement="top">
                <TableCell sx={HEADER_CELL_SX} align="right">Interest</TableCell>
              </Tooltip>
              <TableCell sx={HEADER_CELL_SX} align="right">Principal</TableCell>
              <TableCell sx={HEADER_CELL_SX} align="right">Escrow</TableCell>
              <TableCell sx={HEADER_CELL_SX} align="right">Balance after</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {years.map((year) => (
              <MortgageScheduleYear
                key={year}
                year={year}
                rows={rows.filter((row) => row.dueDate.startsWith(year))}
                isOpen={openYears.includes(year)}
                onToggle={() => toggle(year)}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
