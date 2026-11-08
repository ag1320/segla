import { useSelector } from "react-redux";
import { Box, Typography } from "@mui/material";

// Shown only on the printed page, above the report.
export default function PrintHeader({ title, subtitle }) {
  const entityName = useSelector((state) => state.businessEntities.items[0]?.name ?? "");

  return (
    <Box className="print-only" sx={{ mb: 2 }}>
      <Typography variant="h6">{entityName}</Typography>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>{title}</Typography>
      <Typography variant="body2">{subtitle}</Typography>
    </Box>
  );
}
