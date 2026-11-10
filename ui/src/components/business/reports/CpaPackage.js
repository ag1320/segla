import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DownloadIcon from "@mui/icons-material/Download";
import { Alert, Box, Button, MenuItem, Paper, Table, TableBody, TableCell, TableRow, TextField } from "@mui/material";
import { loadBusinessCpaPackageFiles, loadBusinessCpaPackageFile } from "../../../state/businessReportsSlice";
import { downloadCsv } from "./reportCsv";
import { TABLE_PAPER_SX, CELL_SX, DARK_FIELD_SX } from "../businessStyles";

const ALLOCATIONS = { equal: "Equal shares", rent: "By rent", days_in_service: "By days in service" };
const BUTTON_SX = { color: "#BBE1FA", borderColor: "#BBE1FA" };
const lastYear = () => new Date().getFullYear() - 1;

// Every year-end file the CPA needs, one CSV each.
export default function CpaPackage({ entityId }) {
  const dispatch = useDispatch();
  const files = useSelector((state) => state.businessReports.cpaPackageFiles);
  const [taxYear, setTaxYear] = useState(lastYear());
  const [allocation, setAllocation] = useState("equal");
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    dispatch(loadBusinessCpaPackageFiles());
  }, [dispatch]);

  const download = async (file) => {
    const packageFile = await dispatch(
      loadBusinessCpaPackageFile({ file, query: { entityId, taxYear, allocation } })
    ).unwrap();
    downloadCsv(packageFile);
  };

  // One at a time, so the browser saves each (it may ask once to allow
  // several downloads).
  const run = async (fileKeys) => {
    setDownloading(true);
    try {
      for (const file of fileKeys) {
        await download(file);
      }
      setError(null);
    } catch (message) {
      setError(message);
    }
    setDownloading(false);
  };

  return (
    <>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, mb: 2 }}>
        <TextField select size="small" label="Tax year" value={taxYear} onChange={(event) => setTaxYear(event.target.value)} sx={{ ...DARK_FIELD_SX, minWidth: 120 }}>
          {[0, 1, 2, 3].map((back) => (
            <MenuItem key={back} value={lastYear() + 1 - back}>{lastYear() + 1 - back}</MenuItem>
          ))}
        </TextField>
        <TextField select size="small" label="Schedule E split" value={allocation} onChange={(event) => setAllocation(event.target.value)} sx={{ ...DARK_FIELD_SX, minWidth: 190 }}>
          {Object.entries(ALLOCATIONS).map(([value, label]) => (
            <MenuItem key={value} value={value}>{label}</MenuItem>
          ))}
        </TextField>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={() => run(files.map((item) => item.file))}
          disabled={downloading}
          sx={{ backgroundColor: "#0f4c75", ml: "auto" }}
        >
          Download all
        </Button>
      </Box>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Paper sx={{ ...TABLE_PAPER_SX, maxWidth: 640 }}>
        <Table size="small">
          <TableBody>
            {files.map((item) => (
              <TableRow key={item.file}>
                <TableCell sx={CELL_SX}>{item.title}</TableCell>
                <TableCell sx={CELL_SX} align="right">
                  <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={() => run([item.file])} disabled={downloading} sx={BUTTON_SX}>
                    CSV
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}
