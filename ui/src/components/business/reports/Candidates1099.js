import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Chip,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { loadBusiness1099Candidates } from "../../../state/businessReportsSlice";
import ReportActions from "./ReportActions";
import PrintHeader from "./PrintHeader";
import { csvAmount } from "./reportCsv";
import { formatCents } from "../businessFormat";
import { TABLE_PAPER_SX, HEADER_CELL_SX, CELL_SX, DARK_FIELD_SX, MUTED_TEXT } from "../businessStyles";

const HEADERS = ["Vendor", "Card (excluded)", "Bank", "Personal", "Reportable", "1099", "W-9"];
const lastYear = () => new Date().getFullYear() - 1;

// 1099-eligible vendors (marked in Settings → Vendors) and whether this
// year's non-card payments reach the threshold.
export default function Candidates1099({ entityId }) {
  const dispatch = useDispatch();
  const candidates = useSelector((state) => state.businessReports.candidates1099);
  const [taxYear, setTaxYear] = useState(lastYear());

  useEffect(() => {
    dispatch(loadBusiness1099Candidates({ entityId, taxYear: lastYear() }));
  }, [dispatch, entityId]);

  const handleYear = (event) => {
    setTaxYear(event.target.value);
    dispatch(loadBusiness1099Candidates({ entityId, taxYear: event.target.value }));
  };

  if (!candidates) return null;

  const subtitle = `${candidates.taxYear} · threshold ${formatCents(candidates.thresholdCents)}`;
  const csvRows = () => [
    HEADERS,
    ...candidates.rows.map((row) => [
      row.name,
      csvAmount(row.cardCents),
      csvAmount(row.bankCents),
      csvAmount(row.personalCents),
      csvAmount(row.reportableCents),
      row.needs1099 ? "Yes" : "No",
      row.hasW9OnFile ? row.w9Location || "Yes" : "Missing",
    ]),
  ];

  return (
    <>
      <Box className="no-print" sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, mb: 2 }}>
        <TextField select size="small" label="Tax year" value={taxYear} onChange={handleYear} sx={{ ...DARK_FIELD_SX, minWidth: 120 }}>
          {[0, 1, 2, 3].map((back) => (
            <MenuItem key={back} value={lastYear() + 1 - back}>{lastYear() + 1 - back}</MenuItem>
          ))}
        </TextField>
        <Tooltip title="Confirm the threshold with your CPA">
          <Typography color={MUTED_TEXT}>{`Threshold ${formatCents(candidates.thresholdCents)}`}</Typography>
        </Tooltip>
        <ReportActions title="1099 Candidates" subtitle={subtitle} fileName={`1099-candidates_${candidates.taxYear}.csv`} getCsvRows={csvRows} />
      </Box>
      <PrintHeader title="1099 Candidates" subtitle={subtitle} />
      {candidates.rows.length === 0 ? (
        <Typography color={MUTED_TEXT}>{`No 1099-eligible vendors paid in ${candidates.taxYear}.`}</Typography>
      ) : (
        <Paper sx={TABLE_PAPER_SX}>
          <TableContainer>
            <Table size="small" sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  {HEADERS.map((header, index) => (
                    <TableCell key={header} sx={HEADER_CELL_SX} align={index >= 1 && index <= 4 ? "right" : "left"}>
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {candidates.rows.map((row) => (
                  <TableRow key={row.vendorId}>
                    <TableCell sx={CELL_SX}>{row.name}</TableCell>
                    <TableCell sx={{ ...CELL_SX, color: MUTED_TEXT }} align="right">{formatCents(row.cardCents)}</TableCell>
                    <TableCell sx={CELL_SX} align="right">{formatCents(row.bankCents)}</TableCell>
                    <TableCell sx={CELL_SX} align="right">{formatCents(row.personalCents)}</TableCell>
                    <TableCell sx={{ ...CELL_SX, fontWeight: 700 }} align="right">{formatCents(row.reportableCents)}</TableCell>
                    <TableCell sx={CELL_SX}>
                      {row.needs1099 ? <Chip size="small" color="warning" label="File 1099" /> : "Not needed"}
                    </TableCell>
                    <TableCell sx={CELL_SX}>
                      {row.hasW9OnFile ? (
                        row.w9Location || "On file"
                      ) : (
                        <Chip size="small" color={row.needs1099 ? "error" : "default"} variant={row.needs1099 ? "filled" : "outlined"} label="Missing" sx={row.needs1099 ? {} : { color: "white" }} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </>
  );
}
