import { Box, Table, TableBody, TableCell, TableRow, Typography } from "@mui/material";
import { formatCents } from "../businessFormat";

const percent = (value) => (value === null ? "—" : `${(value * 100).toFixed(2)}%`);
const times = (value, digits = 2) => (value === null ? "—" : `${value.toFixed(digits)}×`);

const BOLD_SX = { fontWeight: 700 };

// analysis: the numbers the server worked out for the current inputs.
export default function DealResults({ analysis }) {
  const ratios = [
    ["Cap rate", percent(analysis.capRate)],
    ["Cash-on-cash", percent(analysis.cashOnCash)],
    ["DSCR", times(analysis.dscr)],
    ["Rent ÷ price", percent(analysis.rentToPrice)],
    ["Gross rent multiplier", times(analysis.grossRentMultiplier, 1)],
    ["Break-even ratio", percent(analysis.breakEvenRatio)],
  ];
  const yearly = [
    ["Rent after vacancy", analysis.effectiveGrossIncomeCents],
    ["Operating expenses", -analysis.operatingExpensesCents],
    ["NOI", analysis.noiCents, BOLD_SX],
    ["Mortgage", -analysis.debtServiceCents],
    ["Cash flow", analysis.cashFlowCents, BOLD_SX],
  ];

  return (
    <Box>
      <Typography variant="h6" sx={{ color: analysis.monthlyCashFlowCents < 0 ? "#d32f2f" : "inherit" }}>
        {`${formatCents(analysis.monthlyCashFlowCents)} / month`}
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {`Cash to close ${formatCents(analysis.cashInvestedCents)} · Loan ${formatCents(analysis.loanCents)}`}
      </Typography>
      <Table size="small">
        <TableBody>
          {yearly.map(([label, cents, sx]) => (
            <TableRow key={label}>
              <TableCell sx={sx}>{label}</TableCell>
              <TableCell sx={sx} align="right">{formatCents(cents)}</TableCell>
            </TableRow>
          ))}
          {ratios.map(([label, value]) => (
            <TableRow key={label}>
              <TableCell>{label}</TableCell>
              <TableCell align="right">{value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
