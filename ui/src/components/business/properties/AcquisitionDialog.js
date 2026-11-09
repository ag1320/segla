import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, Typography } from "@mui/material";
import { previewBusinessAcquisition, acquireBusinessProperty } from "../../../state/businessPropertiesSlice";
import { loadBusinessBankTransactions } from "../../../state/businessBankTransactionsSlice";
import { loadBusinessBankAccounts } from "../../../state/businessBankAccountsSlice";
import { loadBusinessAccounts } from "../../../state/businessAccountsSlice";
import { setSnackbarSuccess } from "../../../state/uiSlice";
import BusinessFormDialog from "../BusinessFormDialog";
import AcquisitionFields from "./AcquisitionFields";
import EntryPreviewTable from "./EntryPreviewTable";
import { DOLLAR_FIELDS, emptyAcquisitionForm, acquisitionTotals, toAcquisition } from "./acquisitionForm";
import { centsOrZero, formatCents, isDollarAmount } from "../businessFormat";

const PERCENT = /^\d{1,3}(\.\d{1,2})?$/;

// Buying a property: type in the closing statement, check that what it
// cost equals how it was paid, review the entry, then post it.
export default function AcquisitionDialog({ property, onClose }) {
  const dispatch = useDispatch();
  const transactions = useSelector((state) => state.businessBankTransactions.items);
  const bankAccounts = useSelector((state) => state.businessBankAccounts.items);
  const [form, setForm] = useState(emptyAcquisitionForm);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(loadBusinessAccounts());
    dispatch(loadBusinessBankAccounts());
    dispatch(loadBusinessBankTransactions({ status: "new" }));
  }, [dispatch]);

  const entityBankAccountIds = bankAccounts
    .filter((bankAccount) => bankAccount.entityId === property.entityId)
    .map((bankAccount) => bankAccount.id);
  const wires = transactions.filter(
    (transaction) =>
      transaction.status === "new" &&
      transaction.amountCents < 0 &&
      entityBankAccountIds.includes(transaction.bankAccountId)
  );
  const wire = wires.find((transaction) => transaction.id === form.bankTransactionId);
  const { costsCents, paidCents, offCents } = acquisitionTotals(form, wire);

  const run = async (thunk, onDone) => {
    setSaving(true);
    try {
      const result = await dispatch(
        thunk({ propertyId: property.id, acquisition: toAcquisition(form, wire) })
      ).unwrap();
      setError(null);
      onDone(result);
    } catch (message) {
      setError(message);
    }
    setSaving(false);
  };

  const handleReview = () => {
    if (!DOLLAR_FIELDS.every((field) => isDollarAmount(form[field])) || centsOrZero(form.purchasePrice) === 0) {
      setError("Enter amounts in dollars, like 350000");
      return;
    }
    if (!PERCENT.test(form.landPercent.trim()) || Number(form.landPercent) >= 100) {
      setError("Enter the land share as a percent under 100, like 25");
      return;
    }
    if (offCents !== 0) {
      setError(`Off by ${formatCents(Math.abs(offCents))}`);
      return;
    }
    run(previewBusinessAcquisition, setPreview);
  };

  const handlePost = () =>
    run(acquireBusinessProperty, () => {
      dispatch(setSnackbarSuccess(true));
      onClose();
    });

  return (
    <BusinessFormDialog
      title={`Record purchase of ${property.name}`}
      error={error}
      saving={saving}
      onClose={onClose}
      onSubmit={preview ? handlePost : handleReview}
      submitLabel={preview ? "Post purchase" : "Review"}
      maxWidth="md"
    >
      {preview ? (
        <>
          <Typography variant="body2">
            {`Basis ${formatCents(preview.basisCents)} · Land ${formatCents(preview.landCents)} · Building ${formatCents(preview.buildingCents)}`}
          </Typography>
          <EntryPreviewTable lines={preview.lines} />
          <Button onClick={() => setPreview(null)} sx={{ alignSelf: "flex-start" }}>
            Back
          </Button>
        </>
      ) : (
        <>
          <AcquisitionFields value={form} wires={wires} onChange={setForm} />
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            <Typography variant="body2">{`Cost ${formatCents(costsCents)} · Paid ${formatCents(paidCents)}`}</Typography>
            {offCents !== 0 && (
              <Typography variant="body2" sx={{ color: "#d32f2f", fontWeight: 600 }}>
                {`Off by ${formatCents(Math.abs(offCents))}`}
              </Typography>
            )}
          </Box>
        </>
      )}
    </BusinessFormDialog>
  );
}
