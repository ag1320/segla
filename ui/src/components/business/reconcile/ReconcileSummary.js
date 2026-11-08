import { Box, Divider, Typography } from "@mui/material";
import { formatCents } from "../businessFormat";

const OFF_COLOR = "#d32f2f";
const TIED_COLOR = "#2e7d32";

// Last statement's balance + checked lines should equal this statement's
// balance. statementBalanceCents is null until a valid amount is typed.
export default function ReconcileSummary({ startingBalanceCents, checkedLines, statementBalanceCents }) {
  const checkedTotal = checkedLines.reduce((total, line) => total + line.amountCents, 0);
  const clearedBalance = startingBalanceCents + checkedTotal;
  const difference = statementBalanceCents === null ? null : statementBalanceCents - clearedBalance;

  const row = (label, cents, sx) => (
    <Box sx={{ display: "flex", justifyContent: "space-between", ...sx }}>
      <Typography variant="body2" sx={{ fontWeight: "inherit", color: "inherit" }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: "inherit", color: "inherit" }}>
        {cents === null ? "—" : formatCents(cents)}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ ml: "auto", width: "100%", maxWidth: 360 }}>
      {row("Last statement balance", startingBalanceCents)}
      {row(`Checked (${checkedLines.length})`, checkedTotal)}
      {row("Cleared balance", clearedBalance, { fontWeight: 600 })}
      {row("Statement balance", statementBalanceCents)}
      <Divider sx={{ my: 0.5 }} />
      {row("Difference", difference, {
        fontWeight: 600,
        color: difference === 0 ? TIED_COLOR : OFF_COLOR,
      })}
    </Box>
  );
}
