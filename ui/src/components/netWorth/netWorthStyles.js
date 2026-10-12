// Shared look for the Net Worth page's panels - same card color/shadow as
// AccountCard so everything reads as one family.
export const panelSx = {
  backgroundColor: "#243447",
  color: "#fff",
  borderRadius: 2,
  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
  p: { xs: 1.5, sm: 3 },
};

export const toggleSx = {
  "& .MuiToggleButton-root": {
    color: "rgba(255,255,255,0.7)",
    borderColor: "rgba(255,255,255,0.2)",
    px: { xs: 1.25, sm: 2 },
    py: 0.5,
    textTransform: "none",
  },
  "& .MuiToggleButton-root.Mui-selected, & .MuiToggleButton-root.Mui-selected:hover": {
    color: "#fff",
    backgroundColor: "#0f4c75",
  },
};

export const mutedText = "rgba(255,255,255,0.6)";
