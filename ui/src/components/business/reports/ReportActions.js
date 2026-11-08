import { useSelector } from "react-redux";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import { Box, Button } from "@mui/material";
import { downloadCsv } from "./reportCsv";

const BUTTON_SX = { color: "#BBE1FA", borderColor: "#BBE1FA" };

// Export CSV and Print for a report. getCsvRows builds the rows only when
// clicked. title and subtitle head both the CSV and the printed page.
export default function ReportActions({ title, subtitle, fileName, getCsvRows }) {
  const entityName = useSelector((state) => state.businessEntities.items[0]?.name ?? "");

  const handleExport = () =>
    downloadCsv({ fileName, title: `${entityName} – ${title}`, subtitle, rows: getCsvRows() });

  return (
    <Box className="no-print" sx={{ display: "flex", gap: 1, ml: "auto" }}>
      <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport} sx={BUTTON_SX}>
        Export CSV
      </Button>
      <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()} sx={BUTTON_SX}>
        Print
      </Button>
    </Box>
  );
}
