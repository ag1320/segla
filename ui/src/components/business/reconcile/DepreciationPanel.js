import { useState } from "react";
import { useDispatch } from "react-redux";
import { Alert, Box, Button, MenuItem, Paper, TextField, Typography } from "@mui/material";
import { postBusinessDepreciation } from "../../../state/businessFixedAssetsSlice";
import { formatDate, recentMonthEnds } from "../businessFormat";
import { DARK_FIELD_SX } from "../businessStyles";

// A month-end step before locking: books each property's depreciation
// through the chosen month. It only posts what's missing, so running it
// again is safe, and after the CPA's figures are in it posts the true-up.
export default function DepreciationPanel({ entityId }) {
  const dispatch = useDispatch();
  const monthEnds = recentMonthEnds(12);
  const [throughDate, setThroughDate] = useState(monthEnds[0]);
  const [result, setResult] = useState(null);
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    setPosting(true);
    try {
      const entries = await dispatch(postBusinessDepreciation({ entityId, throughDate })).unwrap();
      setResult({
        severity: "success",
        message:
          entries.length === 0
            ? `Depreciation was already up to date through ${formatDate(throughDate)}.`
            : `Posted ${entries.length} depreciation ${entries.length === 1 ? "entry" : "entries"} through ${formatDate(throughDate)}.`,
      });
    } catch (message) {
      setResult({ severity: "error", message });
    }
    setPosting(false);
  };

  return (
    <>
      <Typography variant="h6" color="white" sx={{ mt: 3, mb: 1.5 }}>
        Depreciation
      </Typography>
      <Paper sx={{ p: 2, backgroundColor: "#1b262c", color: "white" }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2 }}>
          <TextField
            select
            size="small"
            label="Through"
            value={throughDate}
            onChange={(event) => setThroughDate(event.target.value)}
            sx={{ ...DARK_FIELD_SX, minWidth: 180 }}
          >
            {monthEnds.map((monthEnd) => (
              <MenuItem key={monthEnd} value={monthEnd}>
                {formatDate(monthEnd)}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="contained" onClick={handlePost} disabled={posting} sx={{ backgroundColor: "#0f4c75" }}>
            Post depreciation
          </Button>
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
