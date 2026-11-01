import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Typography } from "@mui/material";

// titleExtra sits right after the title, e.g. a reference popover.
export default function SettingsHeader({ title, titleExtra, addLabel, onAdd }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Typography variant="h6" color="white">
          {title}
        </Typography>
        {titleExtra}
      </Box>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onAdd}
        sx={{ backgroundColor: "#0f4c75" }}
      >
        {addLabel}
      </Button>
    </Box>
  );
}
