import { Box, Tooltip, Typography } from "@mui/material";
import { MUTED_TEXT } from "../businessStyles";

const TILE_SX = {
  flex: "1 1 200px",
  p: 2,
  borderRadius: 2,
  backgroundColor: "#243447",
  color: "white",
  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
};

export default function PropertyTile({ label, value, caption, tooltip = "" }) {
  return (
    <Tooltip title={tooltip} placement="top">
      <Box sx={TILE_SX}>
        <Typography variant="caption" sx={{ color: MUTED_TEXT, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {label}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, my: 0.5 }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: MUTED_TEXT }}>
          {caption}
        </Typography>
      </Box>
    </Tooltip>
  );
}
