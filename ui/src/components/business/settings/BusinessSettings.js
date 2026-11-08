import { Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@mui/material";
import BusinessTabs from "../BusinessTabs";
import ChartOfAccounts from "./ChartOfAccounts";
import Vendors from "./Vendors";
import Rules from "./Rules";

const SETTINGS_TABS = [
  { label: "Chart of Accounts", path: "/business/settings/accounts" },
  { label: "Vendors", path: "/business/settings/vendors" },
  { label: "Rules", path: "/business/settings/rules" },
];

export default function BusinessSettings() {
  return (
    <>
      <BusinessTabs tabs={SETTINGS_TABS} />
      <Box sx={{ mt: 2 }}>
        <Routes>
          <Route index element={<Navigate to="/business/settings/accounts" replace />} />
          <Route path="accounts" element={<ChartOfAccounts />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="rules" element={<Rules />} />
        </Routes>
      </Box>
    </>
  );
}
