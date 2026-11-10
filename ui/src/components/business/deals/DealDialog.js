import { useState } from "react";
import { useDispatch } from "react-redux";
import { Box, Button, TextField } from "@mui/material";
import { analyzeBusinessDeal, addBusinessDeal, updateBusinessDeal } from "../../../state/businessDealsSlice";
import { setSnackbarSuccess } from "../../../state/uiSlice";
import BusinessFormDialog from "../BusinessFormDialog";
import DealFields from "./DealFields";
import DealResults from "./DealResults";
import { dealToForm, formToInputs } from "./dealForm";

const LAYOUT_SX = { display: "grid", gridTemplateColumns: { xs: "1fr", md: "3fr 2fr" }, gap: 3, alignItems: "start" };

// deal is null for a new one. Calculate shows the numbers without saving.
export default function DealDialog({ entityId, deal, onClose }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState(() => dealToForm(deal));
  const [analysis, setAnalysis] = useState(deal?.analysis ?? null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const validInputs = () => {
    const inputs = formToInputs(form);
    if (!inputs) setError("Enter numbers only, like 300000 or 6.5");
    return inputs;
  };

  const handleCalculate = async () => {
    const inputs = validInputs();
    if (!inputs) return;
    try {
      setAnalysis(await dispatch(analyzeBusinessDeal(inputs)).unwrap());
      setError(null);
    } catch (message) {
      setError(message);
    }
  };

  const handleSave = async () => {
    const inputs = validInputs();
    if (!inputs) return;
    setSaving(true);
    try {
      const details = { name: form.name.trim(), inputs };
      const action = deal
        ? updateBusinessDeal({ entityId, id: deal.id, changes: details })
        : addBusinessDeal({ entityId, ...details });
      await dispatch(action).unwrap();
      dispatch(setSnackbarSuccess(true));
      onClose();
    } catch (message) {
      setError(message);
      setSaving(false);
    }
  };

  return (
    <BusinessFormDialog
      title={deal ? deal.name : "New Deal"}
      error={error}
      saving={saving}
      onClose={onClose}
      onSubmit={handleSave}
      maxWidth="lg"
    >
      <Box sx={LAYOUT_SX}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            size="small"
            label="Name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="e.g. 12 Elm St duplex"
            autoFocus
            required
          />
          <DealFields value={form} onChange={setForm} />
        </Box>
        <Box>
          <Button variant="outlined" onClick={handleCalculate} sx={{ mb: 2 }}>
            Calculate
          </Button>
          {analysis && <DealResults analysis={analysis} />}
        </Box>
      </Box>
    </BusinessFormDialog>
  );
}
