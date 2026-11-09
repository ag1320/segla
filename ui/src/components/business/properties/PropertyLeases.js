import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import SavingsIcon from "@mui/icons-material/Savings";
import {
  Alert,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { loadBusinessLeases, removeBusinessLease } from "../../../state/businessLeasesSlice";
import SettingsHeader from "../settings/SettingsHeader";
import LeaseDialog from "./LeaseDialog";
import KeepDepositDialog from "./KeepDepositDialog";
import { LEASE_STATUS_LABELS } from "./propertyLabels";
import { formatCents, formatDate } from "../businessFormat";
import { TABLE_PAPER_SX, TABLE_CONTAINER_SX, HEADER_CELL_SX, CELL_SX, MUTED_TEXT } from "../businessStyles";

const HEADERS = ["Tenant", "Dates", "Rent", "Deposit", "Status", ""];

export default function PropertyLeases({ property }) {
  const dispatch = useDispatch();
  const allLeases = useSelector((state) => state.businessLeases.items);
  const leases = allLeases.filter((lease) => lease.propertyId === property.id);
  const [isAdding, setIsAdding] = useState(false);
  const [editingLease, setEditingLease] = useState(null);
  const [keepingLease, setKeepingLease] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    dispatch(loadBusinessLeases());
  }, [dispatch]);

  const handleDelete = async (lease) => {
    try {
      await dispatch(removeBusinessLease(lease.id)).unwrap();
    } catch (message) {
      setError(message);
    }
  };

  const dates = (lease) =>
    `${formatDate(lease.startDate)} – ${lease.endDate ? formatDate(lease.endDate) : "month-to-month"}`;

  return (
    <>
      <SettingsHeader title="Leases" addLabel="Add lease" onAdd={() => setIsAdding(true)} />
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {leases.length === 0 ? (
        <Typography color={MUTED_TEXT}>No leases yet.</Typography>
      ) : (
        <Paper sx={TABLE_PAPER_SX}>
          <TableContainer sx={TABLE_CONTAINER_SX}>
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
                {leases.map((lease) => (
                  <TableRow key={lease.id} hover sx={{ opacity: lease.status === "ended" ? 0.55 : 1 }}>
                    <TableCell sx={CELL_SX}>{lease.unit ? `${lease.tenantName} · ${lease.unit}` : lease.tenantName}</TableCell>
                    <TableCell sx={{ ...CELL_SX, whiteSpace: "nowrap" }}>{dates(lease)}</TableCell>
                    <TableCell sx={CELL_SX} align="right">{formatCents(lease.monthlyRentCents)}</TableCell>
                    <TableCell sx={CELL_SX} align="right">{formatCents(lease.depositCents)}</TableCell>
                    <TableCell sx={CELL_SX}>{LEASE_STATUS_LABELS[lease.status]}</TableCell>
                    <TableCell sx={{ ...CELL_SX, whiteSpace: "nowrap" }} align="right">
                      <Tooltip title="Keep deposit">
                        <IconButton size="small" onClick={() => setKeepingLease(lease)} aria-label={`keep deposit for ${lease.tenantName}`}>
                          <SavingsIcon sx={{ fill: "white" }} fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <IconButton size="small" onClick={() => setEditingLease(lease)} aria-label={`edit lease for ${lease.tenantName}`}>
                        <EditIcon sx={{ fill: "white" }} fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(lease)} aria-label={`delete lease for ${lease.tenantName}`}>
                        <DeleteOutlineIcon sx={{ fill: "white" }} fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      {isAdding && <LeaseDialog propertyId={property.id} lease={null} onClose={() => setIsAdding(false)} />}
      {editingLease && <LeaseDialog propertyId={property.id} lease={editingLease} onClose={() => setEditingLease(null)} />}
      {keepingLease && <KeepDepositDialog lease={keepingLease} onClose={() => setKeepingLease(null)} />}
    </>
  );
}
