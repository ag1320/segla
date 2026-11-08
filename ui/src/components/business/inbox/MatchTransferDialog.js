import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, Stack, Typography } from "@mui/material";
import { postBusinessBankTransferPair } from "../../../state/businessBankTransactionsSlice";
import { setSnackbarSuccess } from "../../../state/uiSlice";
import BusinessFormDialog from "../BusinessFormDialog";
import TransferSideCard from "./TransferSideCard";
import { formatCents } from "../businessFormat";

const COLUMN_SX = { flex: 1, minWidth: 0 };

// Pairs a transaction with the other side of the same move (usually a card
// payment leaving checking and arriving on the card) and posts both as one
// transfer. Money out is shown on the left, money in on the right.
export default function MatchTransferDialog({ transaction, onClose }) {
  const dispatch = useDispatch();
  const transactions = useSelector((state) => state.businessBankTransactions.items);
  const bankAccounts = useSelector((state) => state.businessBankAccounts.items);
  const candidates = transactions.filter((item) => transaction.transferCandidateIds.includes(item.id));
  const [otherId, setOtherId] = useState(candidates[0]?.id ?? null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const bankAccountName = (id) => bankAccounts.find((bankAccount) => bankAccount.id === id)?.name ?? "";
  const isMoneyOut = transaction.amountCents < 0;
  const hasChoice = candidates.length > 1;

  const columnLabel = (isFromSide, isChoice) => (
    <Typography variant="overline" color="text.secondary">
      {`${isFromSide ? "From" : "To"}${isChoice ? " (pick one)" : ""}`}
    </Typography>
  );

  const thisSide = (
    <Stack spacing={1} sx={COLUMN_SX}>
      {columnLabel(isMoneyOut, false)}
      <TransferSideCard transaction={transaction} bankAccountName={bankAccountName(transaction.bankAccountId)} />
    </Stack>
  );
  const otherSide = (
    <Stack spacing={1} sx={COLUMN_SX}>
      {columnLabel(!isMoneyOut, hasChoice)}
      {candidates.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          The other side isn't in the Inbox. Import the other account's CSV first.
        </Typography>
      )}
      {candidates.map((item) => (
        <TransferSideCard
          key={item.id}
          transaction={item}
          bankAccountName={bankAccountName(item.bankAccountId)}
          isSelected={hasChoice && item.id === otherId}
          onSelect={hasChoice ? () => setOtherId(item.id) : undefined}
        />
      ))}
    </Stack>
  );

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await dispatch(postBusinessBankTransferPair({ id: transaction.id, otherId })).unwrap();
      dispatch(setSnackbarSuccess(true));
      onClose();
    } catch (message) {
      setError(message);
      setSaving(false);
    }
  };

  return (
    <BusinessFormDialog
      title={`Match transfer · ${formatCents(Math.abs(transaction.amountCents))}`}
      error={error}
      saving={saving}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel="Post transfer"
      maxWidth="md"
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
        {isMoneyOut ? thisSide : otherSide}
        <ArrowForwardIcon color="action" sx={{ mt: 7 }} />
        {isMoneyOut ? otherSide : thisSide}
      </Box>
    </BusinessFormDialog>
  );
}
