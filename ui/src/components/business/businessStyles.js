// Shared look for business tables and inputs on the dark page background,
// matching the Net Worth snapshot table.

export const TABLE_PAPER_SX = { width: "100%", overflow: "hidden", backgroundColor: "#1b262c" };

export const TABLE_CONTAINER_SX = { "& .MuiTableRow-root:hover": { backgroundColor: "#333" } };

export const HEADER_CELL_SX = { color: "white", backgroundColor: "#0f4c75" };

export const CELL_SX = { color: "white" };

export const MUTED_TEXT = "rgba(255,255,255,0.6)";

// A TextField sitting directly on the dark background (not in a dialog).
export const DARK_FIELD_SX = {
  "& .MuiInputBase-root": { color: "white" },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" },
  "& .MuiSvgIcon-root": { color: "white" },
};
