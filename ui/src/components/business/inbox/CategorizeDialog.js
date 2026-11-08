import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, TextField, Typography } from "@mui/material";
import { postBusinessBankTransaction } from "../../../state/businessBankTransactionsSlice";
import { loadBusinessMortgagePaymentSplit } from "../../../state/businessMortgagesSlice";
import { setSnackbarSuccess } from "../../../state/uiSlice";
import BusinessFormDialog from "../BusinessFormDialog";
import SplitLineFields from "./SplitLineFields";
import SaveRuleFields from "./SaveRuleFields";
import MortgagePaymentSelect from "./MortgagePaymentSelect";
import { centsOrZero, centsToDollarsText, formatCents, formatDate, isDollarAmount } from "../businessFormat";

let nextSplitKey = 1;
const newSplit = (amount, rule = null) => ({
  key: nextSplitKey++,
  accountId: rule?.accountId ?? "",
  propertyId: rule?.propertyId ?? "",
  vendorId: rule?.vendorId ?? "",
  amount,
  needsCpaReview: false,
});

const idOrNull = (value) => (value === "" ? null : value);

// Posts an imported transaction. The bank side of the entry is filled in
// by the server; the user picks the other side, split across categories
// if needed. A matching rule fills in the first split.
export default function CategorizeDialog({ transaction, onClose }) {
  const dispatch = useDispatch();
  const bankAccounts = useSelector((state) => state.businessBankAccounts.items);
  const allAccounts = useSelector((state) => state.businessAccounts.items);
  const allProperties = useSelector((state) => state.businessProperties.items);
  const vendors = useSelector((state) => state.businessVendors.items);
  const rules = useSelector((state) => state.businessRules.items);
  const allMortgages = useSelector((state) => state.businessMortgages.items);
  const bankAccount = bankAccounts.find((item) => item.id === transaction.bankAccountId);
  const suggestedRule = rules.find((rule) => rule.id === transaction.suggestedRuleId) ?? null;

  // Money moving between two imported accounts is matched as a transfer
  // instead, so those accounts aren't offered as categories.
  const importedAccountIds = bankAccounts.filter((item) => item.importFormat).map((item) => item.accountId);
  const accounts = allAccounts.filter((account) => account.isActive && !importedAccountIds.includes(account.id));
  const properties = allProperties.filter((property) => property.entityId === bankAccount.entityId);
  const mortgages = allMortgages.filter((mortgage) => properties.some((property) => property.id === mortgage.propertyId));
  const propertyName = (propertyId) => properties.find((property) => property.id === propertyId)?.name ?? "";

  const size = Math.abs(transaction.amountCents);
  const isMoneyIn = transaction.amountCents > 0;
  const [memo, setMemo] = useState(transaction.description);
  const isRuleUsable = suggestedRule && accounts.some((account) => account.id === suggestedRule.accountId);
  const [splits, setSplits] = useState([newSplit(centsToDollarsText(size), isRuleUsable ? suggestedRule : null)]);
  const [saveRule, setSaveRule] = useState({ isOn: false, descriptionPattern: transaction.description });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const assigned = splits.reduce((total, split) => total + centsOrZero(split.amount), 0);
  const left = size - assigned;
  const canSaveRule = splits.length === 1 && !suggestedRule;

  const updateSplit = (key, changes) =>
    setSplits(splits.map((split) => (split.key === key ? { ...split, ...changes } : split)));
  const removeSplit = (key) => setSplits(splits.filter((split) => split.key !== key));
  const addSplit = () => setSplits([...splits, newSplit(left > 0 ? centsToDollarsText(left) : "")]);

  // If the bank amount differs (extra principal, a new escrow amount), the
  // "left"/"over" total shows it and the user adjusts a split.
  const fillMortgagePayment = async (mortgageId) => {
    try {
      const split = await dispatch(
        loadBusinessMortgagePaymentSplit({ mortgageId, date: transaction.transactionDate })
      ).unwrap();
      const part = (accountId, cents) => ({
        ...newSplit(centsToDollarsText(cents)),
        accountId,
        propertyId: split.propertyId,
      });
      const parts = [
        part(split.interestAccountId, split.interestCents),
        part(split.principalAccountId, split.principalCents),
      ];
      setSplits(split.escrowCents > 0 ? [...parts, part(split.escrowAccountId, split.escrowCents)] : parts);
      setMemo(`${mortgages.find((mortgage) => mortgage.id === mortgageId).lender} payment #${split.number}`);
      setError(null);
    } catch (message) {
      setError(message);
    }
  };

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
            propertyId: idOrNull(split.propertyId),
            vendorId: idOrNull(split.vendorId),
            amountCents: centsOrZero(split.amount),
            needsCpaReview: split.needsCpaReview,
          })),
          saveRule:
            canSaveRule && saveRule.isOn ? { descriptionPattern: saveRule.descriptionPattern.trim() } : undefined,
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
      {!isMoneyIn && mortgages.length > 0 && (
        <MortgagePaymentSelect mortgages={mortgages} propertyLabel={propertyName} onPick={fillMortgagePayment} />
      )}
      <TextField label="Memo" value={memo} onChange={(event) => setMemo(event.target.value)} />
      {splits.map((split) => (
        <SplitLineFields
          key={split.key}
          split={split}
          accounts={accounts}
          properties={properties}
          vendors={vendors}
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
      {!suggestedRule && <SaveRuleFields value={saveRule} disabled={!canSaveRule} onChange={setSaveRule} />}
    </BusinessFormDialog>
  );
}
