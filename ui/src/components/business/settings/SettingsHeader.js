import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Typography } from "@mui/material";

export default function SettingsHeader({ title, addLabel, onAdd }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
      <Typography variant="h6" color="white">
        {title}
      </Typography>
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
