import { Routes, Route, Navigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import "../Home.css";
import BusinessTabs from "./BusinessTabs";
import BusinessSettings from "./settings/BusinessSettings";

const SECTIONS = [{ label: "Settings", path: "/business/settings" }];

export default function Business() {
  return (
    <Box className="content-box">
      <Typography variant="h5" color="white" sx={{ mb: 1 }}>
        Gettemy Properties
      </Typography>
      <BusinessTabs tabs={SECTIONS} />
      <Box sx={{ mt: 2 }}>
        <Routes>
          <Route index element={<Navigate to="/business/settings" replace />} />
          <Route path="settings/*" element={<BusinessSettings />} />
        </Routes>
      </Box>
      <Box className="page-margin" />
    </Box>
  );
}
