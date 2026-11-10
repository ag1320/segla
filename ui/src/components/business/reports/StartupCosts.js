import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import FlagIcon from "@mui/icons-material/Flag";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { loadBusinessStartupCosts } from "../../../state/businessReportsSlice";
import ReportActions from "./ReportActions";
import PrintHeader from "./PrintHeader";
import { csvAmount } from "./reportCsv";
import { formatCents, formatDate, todayDateString } from "../businessFormat";
import { TABLE_PAPER_SX, HEADER_CELL_SX, CELL_SX, DARK_FIELD_SX, MUTED_TEXT } from "../businessStyles";

const GROUP_SX = { ...CELL_SX, fontWeight: 700, backgroundColor: "rgba(255,255,255,0.04)" };
const groupName = (row) => row.propertyName ?? "Company-wide";

// Everything in 1600 Startup & Pre-Service Costs, by property, for the CPA
// to sort into startup deductions or basis.
export default function StartupCosts({ entityId }) {
  const dispatch = useDispatch();
  const summary = useSelector((state) => state.businessReports.startupCosts);
  const [asOfDate, setAsOfDate] = useState(todayDateString());

  useEffect(() => {
    dispatch(loadBusinessStartupCosts({ entityId, asOfDate: todayDateString() }));
  }, [dispatch, entityId]);

  const handleDate = (event) => {
    setAsOfDate(event.target.value);
    if (event.target.value) dispatch(loadBusinessStartupCosts({ entityId, asOfDate: event.target.value }));
  };

  if (!summary) return null;

  const subtitle = `Through ${formatDate(summary.asOfDate)}`;
  const csvRows = () => [
    ["Property", "Date", "Memo", "Vendor", "Amount", "CPA review"],
    ...summary.rows.flatMap((row) =>
      row.lines.map((line) => [
        groupName(row),
        line.entryDate,
        line.memo ?? "",
        line.vendorName ?? "",
        csvAmount(line.amountCents),
        line.needsCpaReview ? "Yes" : "",
      ])
    ),
    ["Total", "", "", "", csvAmount(summary.totalCents), ""],
  ];

  return (
    <>
      <Box className="no-print" sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, mb: 2 }}>
        <TextField label="Through" type="date" size="small" value={asOfDate} onChange={handleDate} InputLabelProps={{ shrink: true }} sx={DARK_FIELD_SX} />
        <ReportActions title="Startup Costs" subtitle={subtitle} fileName={`startup-costs_${summary.asOfDate}.csv`} getCsvRows={csvRows} />
      </Box>
      <PrintHeader title="Startup Costs" subtitle={subtitle} />
      {summary.rows.length === 0 ? (
        <Typography color={MUTED_TEXT}>Nothing in 1600 Startup & Pre-Service Costs yet.</Typography>
      ) : (
        <Paper sx={TABLE_PAPER_SX}>
          <TableContainer>
            <Table size="small" sx={{ minWidth: 640 }}>
              <TableHead>
                <TableRow>
                  {["Date", "Memo", "Vendor", "Amount"].map((header) => (
                    <TableCell key={header} sx={HEADER_CELL_SX} align={header === "Amount" ? "right" : "left"}>{header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {summary.rows.map((row) => (
                  <Fragment key={row.propertyId ?? "company"}>
                    <TableRow>
                      <TableCell sx={GROUP_SX} colSpan={3}>
                        {groupName(row)}
                        {row.placedInServiceDate && (
                          <Typography component="span" variant="body2" sx={{ color: MUTED_TEXT, ml: 1 }}>
                            {`in service ${formatDate(row.placedInServiceDate)}`}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={GROUP_SX} align="right">{formatCents(row.totalCents)}</TableCell>
                    </TableRow>
                    {row.lines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell sx={{ ...CELL_SX, whiteSpace: "nowrap" }}>{formatDate(line.entryDate)}</TableCell>
                        <TableCell sx={CELL_SX}>
                          {line.memo ?? `Entry #${line.entryId}`}
                          {line.needsCpaReview && <FlagIcon fontSize="inherit" sx={{ ml: 1, color: "#f9a825", verticalAlign: "middle" }} />}
                        </TableCell>
                        <TableCell sx={{ ...CELL_SX, color: MUTED_TEXT }}>{line.vendorName ?? "—"}</TableCell>
                        <TableCell sx={CELL_SX} align="right">{formatCents(line.amountCents)}</TableCell>
                      </TableRow>
                    ))}
                  </Fragment>
                ))}
                <TableRow>
                  <TableCell sx={{ ...CELL_SX, fontWeight: 700, borderTop: "2px solid rgba(255,255,255,0.4)" }} colSpan={3}>Total</TableCell>
                  <TableCell sx={{ ...CELL_SX, fontWeight: 700, borderTop: "2px solid rgba(255,255,255,0.4)" }} align="right">
                    {formatCents(summary.totalCents)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </>
  );
}
