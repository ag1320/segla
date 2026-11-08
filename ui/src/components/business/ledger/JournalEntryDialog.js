import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, MenuItem, TextField, Typography } from "@mui/material";
import { addBusinessJournalEntry } from "../../../state/businessJournalEntriesSlice";
import { setSnackbarSuccess } from "../../../state/uiSlice";
import BusinessFormDialog from "../BusinessFormDialog";
import JournalLineFields from "./JournalLineFields";
import { centsOrZero, formatCents, isDollarAmount, todayDateString } from "../businessFormat";

let nextLineKey = 1;
const emptyLine = () => ({
  key: nextLineKey++,
  accountId: "",
  propertyId: "",
  debit: "",
  credit: "",
  needsCpaReview: false,
});

const isBlankLine = (line) =>
  line.accountId === "" && line.debit.trim() === "" && line.credit.trim() === "";

export default function JournalEntryDialog({ onClose }) {
  const dispatch = useDispatch();
  const entities = useSelector((state) => state.businessEntities.items);
  const accounts = useSelector((state) => state.businessAccounts.items);
  const properties = useSelector((state) => state.businessProperties.items);
  const [entityId, setEntityId] = useState(entities[0]?.id ?? "");
  const [entryDate, setEntryDate] = useState(todayDateString());
  const [memo, setMemo] = useState("");
  const [lines, setLines] = useState([emptyLine(), emptyLine()]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const totalDebits = lines.reduce((total, line) => total + centsOrZero(line.debit), 0);
  const totalCredits = lines.reduce((total, line) => total + centsOrZero(line.credit), 0);
  const difference = totalDebits - totalCredits;

  const updateLine = (key, changes) =>
    setLines(lines.map((line) => (line.key === key ? { ...line, ...changes } : line)));
  const removeLine = (key) => setLines(lines.filter((line) => line.key !== key));

  const handleSubmit = async () => {
    const filledLines = lines.filter((line) => !isBlankLine(line));
    if (filledLines.some((line) => line.accountId === "")) {
      setError("Pick an account on every line");
      return;
    }
    if (filledLines.some((line) => !isDollarAmount(line.debit) || !isDollarAmount(line.credit))) {
      setError("Enter amounts in dollars, like 250.00");
      return;
    }

    setSaving(true);
    try {
      await dispatch(
        addBusinessJournalEntry({
          entityId,
          entryDate,
          memo: memo || null,
          lines: filledLines.map((line) => ({
            accountId: line.accountId,
            propertyId: line.propertyId === "" ? null : line.propertyId,
            debitCents: centsOrZero(line.debit),
            creditCents: centsOrZero(line.credit),
            needsCpaReview: line.needsCpaReview,
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
      title="New Journal Entry"
      error={error}
      saving={saving}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel="Post"
      maxWidth="lg"
    >
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        <TextField select label="Entity" value={entityId} onChange={(event) => setEntityId(event.target.value)}>
          {entities.map((entity) => (
            <MenuItem key={entity.id} value={entity.id}>
              {entity.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Date"
          type="date"
          value={entryDate}
          onChange={(event) => setEntryDate(event.target.value)}
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          label="Memo"
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
          sx={{ flex: "1 1 300px" }}
        />
      </Box>
      {lines.map((line) => (
        <JournalLineFields
          key={line.key}
          line={line}
          accounts={accounts.filter((account) => account.isActive)}
          properties={properties.filter((property) => property.entityId === entityId)}
          onChange={(changes) => updateLine(line.key, changes)}
          onRemove={() => removeLine(line.key)}
        />
      ))}
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        <Button startIcon={<AddIcon />} onClick={() => setLines([...lines, emptyLine()])}>
          Add line
        </Button>
        <Typography variant="body2">
          {`Debits ${formatCents(totalDebits)} · Credits ${formatCents(totalCredits)}`}
          {difference !== 0 && (
            <span style={{ color: "#d32f2f", fontWeight: 600 }}>
              {` · Off by ${formatCents(Math.abs(difference))}`}
            </span>
          )}
        </Typography>
      </Box>
    </BusinessFormDialog>
  );
}
