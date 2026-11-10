import { Link as RouterLink } from "react-router-dom";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Box, Link, Paper, Typography } from "@mui/material";
import { formatDate } from "../businessFormat";
import { MUTED_TEXT } from "../businessStyles";

const PANEL_SX = { p: 2, backgroundColor: "#243447", color: "white", borderRadius: 2 };

// alerts: what the dashboard says needs doing; each links to where it's done.
export default function DashboardAlerts({ alerts }) {
  const items = [
    alerts.inboxCount > 0 && {
      key: "inbox",
      text: `${alerts.inboxCount} transaction${alerts.inboxCount === 1 ? "" : "s"} to categorize`,
      to: "/business/inbox",
    },
    ...alerts.unreconciledAccounts.map((account) => ({
      key: `reconcile-${account.bankAccountId}`,
      text: `${account.name}: reconciled through ${account.reconciledThrough ? formatDate(account.reconciledThrough) : "never"}`,
      to: "/business/reconcile",
    })),
    alerts.cpaFlagCount > 0 && {
      key: "cpa",
      text: `${alerts.cpaFlagCount} item${alerts.cpaFlagCount === 1 ? "" : "s"} flagged for the CPA this year`,
      to: "/business/reports/cpa-package",
    },
    ...alerts.leasesEnding.map((lease) => ({
      key: `lease-${lease.leaseId}`,
      text: `${lease.tenantName}'s lease ends ${formatDate(lease.endDate)}`,
      to: "/business/reports/rent-roll",
    })),
  ].filter(Boolean);

  return (
    <Paper sx={PANEL_SX}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>To do</Typography>
      {items.length === 0 ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: MUTED_TEXT }}>
          <CheckCircleOutlineIcon fontSize="small" />
          <Typography variant="body2">All caught up</Typography>
        </Box>
      ) : (
        items.map((item) => (
          <Box key={item.key} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.5 }}>
            <WarningAmberIcon fontSize="small" sx={{ color: "#f9a825" }} />
            <Link component={RouterLink} to={item.to} sx={{ color: "#BBE1FA" }}>
              {item.text}
            </Link>
          </Box>
        ))
      )}
    </Paper>
  );
}
