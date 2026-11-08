import { Box, Paper, Typography } from "@mui/material";
import { formatCents, formatDate } from "../businessFormat";

const SELECTED_COLOR = "#0f4c75";

// One side of a transfer. onSelect is set only when there are several
// possible other sides to choose from.
export default function TransferSideCard({ transaction, bankAccountName, isSelected, onSelect }) {
  return (
    <Paper
      variant="outlined"
      onClick={onSelect}
      sx={{
        p: 1.5,
        borderWidth: 2,
        borderColor: isSelected ? SELECTED_COLOR : "divider",
        cursor: onSelect ? "pointer" : "default",
      }}
    >
      <Typography variant="subtitle2">{bankAccountName}</Typography>
      <Typography variant="body2" color="text.secondary" noWrap title={transaction.description}>
        {transaction.description}
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {formatDate(transaction.transactionDate)}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {formatCents(transaction.amountCents)}
        </Typography>
      </Box>
    </Paper>
  );
}
