import { Routes, Route, Navigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import "../Home.css";
import BusinessTabs from "./BusinessTabs";
import BusinessSettings from "./settings/BusinessSettings";
import Inbox from "./inbox/Inbox";
import Ledger from "./ledger/Ledger";
import Reconcile from "./reconcile/Reconcile";
import Reports from "./reports/Reports";
import PropertyList from "./properties/PropertyList";
import PropertyDetail from "./properties/PropertyDetail";

const SECTIONS = [
  { label: "Inbox", path: "/business/inbox" },
  { label: "Ledger", path: "/business/ledger" },
  { label: "Reconcile", path: "/business/reconcile" },
  { label: "Reports", path: "/business/reports" },
  { label: "Properties", path: "/business/properties" },
  { label: "Settings", path: "/business/settings" },
];

export default function Business() {
  return (
    <Box className="content-box">
      <Typography variant="h5" color="white" sx={{ mb: 1 }}>
        Gettemy Properties
      </Typography>
      <BusinessTabs tabs={SECTIONS} />
      <Box sx={{ mt: 2 }}>
        <Routes>
          <Route index element={<Navigate to="/business/inbox" replace />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="ledger" element={<Ledger />} />
          <Route path="reconcile" element={<Reconcile />} />
          <Route path="reports/*" element={<Reports />} />
          <Route path="properties" element={<PropertyList />} />
          <Route path="properties/:propertyId/*" element={<PropertyDetail />} />
          <Route path="settings/*" element={<BusinessSettings />} />
        </Routes>
      </Box>
      <Box className="page-margin" />
    </Box>
  );
}
