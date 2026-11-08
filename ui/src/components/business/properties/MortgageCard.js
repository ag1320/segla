import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import { Box, Button, Typography } from "@mui/material";
import { loadBusinessMortgageSchedule } from "../../../state/businessMortgagesSlice";
import PropertyTile from "./PropertyTile";
import MortgageSchedule from "./MortgageSchedule";
import { formatCents, formatDate, todayDateString } from "../businessFormat";
import { MUTED_TEXT } from "../businessStyles";

// One mortgage: what a payment is made of, where the balance stands per the
// schedule, and the schedule itself.
export default function MortgageCard({ mortgage, onEdit, onDelete }) {
  const dispatch = useDispatch();
  const rows = useSelector((state) => state.businessMortgages.schedules[mortgage.id]);

  useEffect(() => {
    dispatch(loadBusinessMortgageSchedule(mortgage.id));
  }, [dispatch, mortgage.id]);

  const today = todayDateString();
  const paidRows = rows ? rows.filter((row) => row.dueDate <= today) : [];
  const lastPaid = paidRows.length > 0 ? paidRows[paidRows.length - 1] : null;
  const lastRow = rows ? rows[rows.length - 1] : null;

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mb: 1.5 }}>
        <Typography variant="h6" color="white">
          {mortgage.lender}
        </Typography>
        <Typography variant="body2" sx={{ color: MUTED_TEXT }}>
          {`Starting balance ${formatCents(mortgage.originalPrincipalCents)} · first payment ${formatDate(mortgage.firstPaymentDate)}`}
        </Typography>
        <Box sx={{ ml: "auto" }}>
          <Button size="small" startIcon={<EditIcon />} onClick={onEdit} sx={{ color: "white" }}>
            Edit
          </Button>
          <Button size="small" startIcon={<DeleteOutlineIcon />} onClick={onDelete} sx={{ color: "white" }}>
            Delete
          </Button>
        </Box>
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <PropertyTile
          label="Monthly payment"
          value={formatCents(mortgage.monthlyPaymentCents + mortgage.monthlyEscrowCents)}
          caption={`${formatCents(mortgage.monthlyPaymentCents)} principal & interest + ${formatCents(mortgage.monthlyEscrowCents)} escrow`}
        />
        <PropertyTile
          label="Balance"
          value={formatCents(lastPaid ? lastPaid.balanceCents : mortgage.originalPrincipalCents)}
          caption={lastPaid ? `After the ${formatDate(lastPaid.dueDate)} payment` : "No payments due yet"}
          tooltip="Per the schedule. Extra principal payments make the real balance lower."
        />
        <PropertyTile
          label="Rate and term"
          value={`${mortgage.annualRatePercent}% · ${mortgage.termMonths % 12 === 0 ? `${mortgage.termMonths / 12} yrs` : `${mortgage.termMonths} mo`}`}
          caption={lastRow ? `Paid off ${formatDate(lastRow.dueDate)}` : ""}
        />
      </Box>
      {rows && <MortgageSchedule rows={rows} />}
    </Box>
  );
}
