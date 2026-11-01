import { Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@mui/material";
import BusinessTabs from "../BusinessTabs";
import ChartOfAccounts from "./ChartOfAccounts";
import Properties from "./Properties";

const SETTINGS_TABS = [
  { label: "Chart of Accounts", path: "/business/settings/accounts" },
  { label: "Properties", path: "/business/settings/properties" },
];

export default function BusinessSettings() {
  return (
    <>
      <BusinessTabs tabs={SETTINGS_TABS} />
      <Box sx={{ mt: 2 }}>
        <Routes>
          <Route index element={<Navigate to="/business/settings/accounts" replace />} />
          <Route path="accounts" element={<ChartOfAccounts />} />
          <Route path="properties" element={<Properties />} />
        </Routes>
      </Box>
    </>
  );
}
