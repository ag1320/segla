import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { loadBusinessRentRoll } from "../../../state/businessReportsSlice";
import ReportActions from "./ReportActions";
import PrintHeader from "./PrintHeader";
import { csvAmount } from "./reportCsv";
import { LEASE_STATUS_LABELS } from "../properties/propertyLabels";
import { formatCents, formatDate, todayDateString } from "../businessFormat";
import { TABLE_PAPER_SX, HEADER_CELL_SX, CELL_SX, DARK_FIELD_SX, MUTED_TEXT } from "../businessStyles";

const TOTAL_CELL_SX = { ...CELL_SX, fontWeight: 700, borderTop: "2px solid rgba(255,255,255,0.4)" };
const HEADERS = ["Property", "Tenant", "Lease", "Status", "Rent", "Deposit"];

const leaseDates = (lease) =>
  `${formatDate(lease.startDate)} – ${lease.endDate ? formatDate(lease.endDate) : "month-to-month"}`;

// One row per current or upcoming lease (or "Vacant"), plus whether the
// deposits on the leases match the deposits the books hold.
export default function RentRoll({ entityId }) {
  const dispatch = useDispatch();
  const rentRoll = useSelector((state) => state.businessReports.rentRoll);
  const [asOfDate, setAsOfDate] = useState(todayDateString());

  useEffect(() => {
    dispatch(loadBusinessRentRoll({ entityId, asOfDate: todayDateString() }));
  }, [dispatch, entityId]);

  const handleDateChange = (event) => {
    setAsOfDate(event.target.value);
    if (event.target.value) dispatch(loadBusinessRentRoll({ entityId, asOfDate: event.target.value }));
  };

  // [key, property, tenant, lease, status, rentCents, depositCents]
  const lines = rentRoll
    ? rentRoll.rows.flatMap((row) => [
        ...row.leases.map((lease) => [
          `lease-${lease.id}`,
          row.name,
          lease.unit ? `${lease.tenantName} · ${lease.unit}` : lease.tenantName,
          leaseDates(lease),
          LEASE_STATUS_LABELS[lease.status],
          lease.status === "upcoming" ? null : lease.monthlyRentCents,
          lease.depositCents,
        ]),
        ...(row.isVacant ? [[`vacant-${row.propertyId}`, row.name, "Vacant", "", "", null, null]] : []),
      ])
    : [];
  const depositGapCents = rentRoll ? rentRoll.depositsHeldCents - rentRoll.depositsOnLeasesCents : 0;
  const subtitle = rentRoll ? `As of ${formatDate(rentRoll.asOfDate)}` : "";
  const csvRows = () => [
    HEADERS,
    ...lines.map(([, ...cells]) => [...cells.slice(0, 4), csvAmount(cells[4] ?? 0), csvAmount(cells[5] ?? 0)]),
    ["Total", "", "", "", csvAmount(rentRoll.monthlyRentCents), csvAmount(rentRoll.depositsOnLeasesCents)],
    ["Deposits held (books)", "", "", "", "", csvAmount(rentRoll.depositsHeldCents)],
  ];

  return (
    <>
      <Box className="no-print" sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, mb: 2 }}>
        <TextField
          label="As of"
          type="date"
          size="small"
          value={asOfDate}
          onChange={handleDateChange}
          InputLabelProps={{ shrink: true }}
          sx={DARK_FIELD_SX}
        />
        {rentRoll && (
          <Chip
            label={depositGapCents === 0 ? "Deposits tie" : `Deposits off by ${formatCents(Math.abs(depositGapCents))}`}
            color={depositGapCents === 0 ? "success" : "warning"}
          />
        )}
        {rentRoll && (
          <ReportActions title="Rent Roll" subtitle={subtitle} fileName={`rent-roll_${rentRoll.asOfDate}.csv`} getCsvRows={csvRows} />
        )}
      </Box>
      {rentRoll && <PrintHeader title="Rent Roll" subtitle={subtitle} />}
      {rentRoll && (
        <Paper sx={TABLE_PAPER_SX}>
          <TableContainer>
            <Table size="small" sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  {HEADERS.map((header) => (
                    <TableCell key={header} sx={HEADER_CELL_SX} align={["Rent", "Deposit"].includes(header) ? "right" : "left"}>
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {lines.map(([key, property, tenant, lease, status, rentCents, depositCents]) => (
                  <TableRow key={key}>
                    <TableCell sx={CELL_SX}>{property}</TableCell>
                    <TableCell sx={{ ...CELL_SX, color: tenant === "Vacant" ? MUTED_TEXT : "white" }}>{tenant}</TableCell>
                    <TableCell sx={{ ...CELL_SX, whiteSpace: "nowrap" }}>{lease}</TableCell>
                    <TableCell sx={CELL_SX}>{status}</TableCell>
                    <TableCell sx={CELL_SX} align="right">{rentCents === null ? "—" : formatCents(rentCents)}</TableCell>
                    <TableCell sx={CELL_SX} align="right">{depositCents === null ? "—" : formatCents(depositCents)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell sx={TOTAL_CELL_SX} colSpan={4}>Total</TableCell>
                  <TableCell sx={TOTAL_CELL_SX} align="right">{formatCents(rentRoll.monthlyRentCents)}</TableCell>
                  <TableCell sx={TOTAL_CELL_SX} align="right">{formatCents(rentRoll.depositsOnLeasesCents)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ ...CELL_SX, color: MUTED_TEXT }} colSpan={5}>Deposits held (books)</TableCell>
                  <TableCell sx={{ ...CELL_SX, color: MUTED_TEXT }} align="right">{formatCents(rentRoll.depositsHeldCents)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </>
  );
}
