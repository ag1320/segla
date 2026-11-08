import { Fragment } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { formatCents } from "../businessFormat";
import { TABLE_PAPER_SX, HEADER_CELL_SX, CELL_SX, MUTED_TEXT } from "../businessStyles";

const SECTION_CELL_SX = { ...CELL_SX, fontWeight: 700, pt: 2 };
const TOTAL_CELL_SX = { ...CELL_SX, fontWeight: 700, borderTop: "1px solid rgba(255,255,255,0.4)" };
const GRAND_CELL_SX = { ...CELL_SX, fontWeight: 700, fontSize: "1rem", borderTop: "2px solid rgba(255,255,255,0.6)" };

// A P&L or balance sheet. sections: [{ title, totalLabel, section }], where
// section is { rows, totalCents, compareTotalCents } from the reports
// slice. summaryRows: [{ label, cents, compareCents }] after the sections.
// columnLabels: [current] or [current, comparison].
export default function StatementTable({ columnLabels, sections, summaryRows }) {
  const hasComparison = columnLabels.length > 1;

  const amountCells = (cents, compareCents, sx) => (
    <>
      <TableCell sx={sx} align="right">{formatCents(cents)}</TableCell>
      {hasComparison && (
        <>
          <TableCell sx={sx} align="right">{formatCents(compareCents)}</TableCell>
          <TableCell sx={{ ...sx, color: MUTED_TEXT }} align="right">{formatCents(cents - compareCents)}</TableCell>
        </>
      )}
    </>
  );

  return (
    <Paper sx={TABLE_PAPER_SX}>
      <TableContainer>
        <Table size="small" sx={{ minWidth: hasComparison ? 700 : 480 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={HEADER_CELL_SX}>Account</TableCell>
              {columnLabels.map((label) => (
                <TableCell key={label} sx={HEADER_CELL_SX} align="right">{label}</TableCell>
              ))}
              {hasComparison && <TableCell sx={HEADER_CELL_SX} align="right">Change</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {sections.map(({ title, totalLabel, section }) => (
              <Fragment key={title}>
                <TableRow>
                  <TableCell sx={SECTION_CELL_SX} colSpan={hasComparison ? 4 : 2}>{title}</TableCell>
                </TableRow>
                {section.rows.map((row) => (
                  <TableRow key={row.key}>
                    <TableCell sx={{ ...CELL_SX, pl: 4 }}>
                      {row.accountNumber ? `${row.accountNumber} ${row.name}` : row.name}
                    </TableCell>
                    {amountCells(row.amountCents, row.compareAmountCents, CELL_SX)}
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell sx={TOTAL_CELL_SX}>{totalLabel}</TableCell>
                  {amountCells(section.totalCents, section.compareTotalCents, TOTAL_CELL_SX)}
                </TableRow>
              </Fragment>
            ))}
            {summaryRows.map((row) => (
              <TableRow key={row.label}>
                <TableCell sx={GRAND_CELL_SX}>{row.label}</TableCell>
                {amountCells(row.cents, row.compareCents, GRAND_CELL_SX)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
