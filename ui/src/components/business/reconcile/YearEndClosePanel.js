import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Box, Button, MenuItem, Paper, TextField, Tooltip, Typography } from "@mui/material";
import { closeBusinessYear, loadBusinessYearClosings } from "../../../state/businessYearClosingsSlice";
import { formatCents } from "../businessFormat";
import { DARK_FIELD_SX, MUTED_TEXT } from "../businessStyles";

const YEARS_TO_OFFER = 3;

// After the CPA's figures are in and December is reconciled: moves the
// year's net income into retained earnings, then lock December.
export default function YearEndClosePanel({ entityId }) {
  const dispatch = useDispatch();
  const closings = useSelector((state) => state.businessYearClosings.items);
  const lastYear = new Date().getFullYear() - 1;
  const [year, setYear] = useState(lastYear);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(loadBusinessYearClosings(entityId));
  }, [dispatch, entityId]);

  const handleClose = async () => {
    setSaving(true);
    try {
      const closing = await dispatch(closeBusinessYear({ entityId, year })).unwrap();
      setResult({ severity: "success", message: `${year} closed: ${formatCents(closing.net_income_cents)} to retained earnings.` });
    } catch (message) {
      setResult({ severity: "error", message });
    }
    setSaving(false);
  };

  return (
    <>
      <Typography variant="h6" color="white" sx={{ mt: 3, mb: 1.5 }}>
        Year-End Close
      </Typography>
      <Paper sx={{ p: 2, backgroundColor: "#1b262c", color: "white" }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2 }}>
          <TextField select size="small" label="Year" value={year} onChange={(event) => setYear(event.target.value)} sx={{ ...DARK_FIELD_SX, minWidth: 120 }}>
            {Array.from({ length: YEARS_TO_OFFER }, (_, index) => lastYear - index).map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
          <Tooltip title="Reverse the close in the Ledger to reopen a year">
            <span>
              <Button variant="contained" onClick={handleClose} disabled={saving} sx={{ backgroundColor: "#0f4c75" }}>
                Close year
              </Button>
            </span>
          </Tooltip>
          {closings.map((closing) => (
            <Typography key={closing.journalEntryId} variant="body2" sx={{ color: MUTED_TEXT }}>
              {`${closing.year} closed · ${formatCents(closing.netIncomeCents)} · entry #${closing.journalEntryId}`}
            </Typography>
          ))}
        </Box>
        {result && (
          <Alert severity={result.severity} onClose={() => setResult(null)} sx={{ mt: 2 }}>
            {result.message}
          </Alert>
        )}
      </Paper>
    </>
  );
}
