import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, TextField, Typography } from "@mui/material";
import { postBusinessBankTransaction } from "../../../state/businessBankTransactionsSlice";
import { setSnackbarSuccess } from "../../../state/uiSlice";
import BusinessFormDialog from "../BusinessFormDialog";
import SplitLineFields from "./SplitLineFields";
import { centsOrZero, centsToDollarsText, formatCents, formatDate, isDollarAmount } from "../businessFormat";

let nextSplitKey = 1;
const newSplit = (amount) => ({
  key: nextSplitKey++,
  accountId: "",
  propertyId: "",
  amount,
  needsCpaReview: false,
});

// Posts an imported transaction. The bank side of the entry is filled in
// by the server; the user picks the other side, split across categories
// if needed.
export default function CategorizeDialog({ transaction, onClose }) {
  const dispatch = useDispatch();
  const bankAccount = useSelector((state) =>
    state.businessBankAccounts.items.find((item) => item.id === transaction.bankAccountId)
  );
  const allAccounts = useSelector((state) => state.businessAccounts.items);
  const allProperties = useSelector((state) => state.businessProperties.items);
  const accounts = allAccounts.filter((account) => account.isActive && account.id !== bankAccount.accountId);
  const properties = allProperties.filter((property) => property.entityId === bankAccount.entityId);

  const size = Math.abs(transaction.amountCents);
  const isMoneyIn = transaction.amountCents > 0;
  const [memo, setMemo] = useState(transaction.description);
  const [splits, setSplits] = useState([newSplit(centsToDollarsText(size))]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const assigned = splits.reduce((total, split) => total + centsOrZero(split.amount), 0);
  const left = size - assigned;

  const updateSplit = (key, changes) =>
    setSplits(splits.map((split) => (split.key === key ? { ...split, ...changes } : split)));
  const removeSplit = (key) => setSplits(splits.filter((split) => split.key !== key));
  const addSplit = () => setSplits([...splits, newSplit(left > 0 ? centsToDollarsText(left) : "")]);

  const handleSubmit = async () => {
    if (splits.some((split) => split.accountId === "")) {
      setError("Pick a category on every split");
      return;
    }
    if (splits.some((split) => !isDollarAmount(split.amount) || centsOrZero(split.amount) <= 0)) {
      setError("Enter each split's amount in dollars, like 25.00");
      return;
    }

    setSaving(true);
    try {
      await dispatch(
        postBusinessBankTransaction({
          id: transaction.id,
          memo: memo.trim() || null,
          splits: splits.map((split) => ({
            accountId: split.accountId,
            propertyId: split.propertyId === "" ? null : split.propertyId,
            amountCents: centsOrZero(split.amount),
            needsCpaReview: split.needsCpaReview,
          })),
        })
      ).unwrap();
      dispatch(setSnackbarSuccess(true));
      onClose();
    } catch (message) {
      setError(message);
      setSaving(false);
    }
  };

  return (
    <BusinessFormDialog
      title="Categorize transaction"
      error={error}
      saving={saving}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel="Post"
      maxWidth="md"
    >
      <Box>
        <Typography variant="body2">
          {`${formatDate(transaction.transactionDate)} · ${bankAccount.name}`}
        </Typography>
        <Typography variant="h6">
          {`${isMoneyIn ? "Money in" : "Money out"}: ${formatCents(size)}`}
        </Typography>
        <Typography variant="body2">
          {isMoneyIn ? "Where did this money come from?" : "What was this money spent on?"}
        </Typography>
      </Box>
      <TextField label="Memo" value={memo} onChange={(event) => setMemo(event.target.value)} />
      {splits.map((split) => (
        <SplitLineFields
          key={split.key}
          split={split}
          accounts={accounts}
          properties={properties}
          canRemove={splits.length > 1}
          onChange={(changes) => updateSplit(split.key, changes)}
          onRemove={() => removeSplit(split.key)}
        />
      ))}
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        <Button startIcon={<AddIcon />} onClick={addSplit}>
          Add split
        </Button>
        <Typography variant="body2">
          {`Assigned ${formatCents(assigned)} of ${formatCents(size)}`}
          {left !== 0 && (
            <span style={{ color: "#d32f2f", fontWeight: 600 }}>
              {` · ${formatCents(Math.abs(left))} ${left > 0 ? "left" : "over"}`}
            </span>
          )}
        </Typography>
      </Box>
    </BusinessFormDialog>
  );
}
