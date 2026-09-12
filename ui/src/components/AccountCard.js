import { Card, CardContent, Box, Typography } from "@mui/material";

// Mobile stand-in for one row of an account table (Retirement/Investments/
// Reserve/Loans all share this same getColumns()-shaped data). Rather than
// scrolling a wide table sideways on a phone, each row becomes a card:
// actions (edit/delete, or a "Go To"/"See Chart" link) up top, then every
// other column as a label:value line. Reuses the same `columns` array
// (including each column's `format`) the desktop <Table> already uses, so
// currency formatting stays identical between the two layouts.
//
// Also doubles as the totals summary - pass a plain `{ columnId: number }`
// object as `row` (only the columns that have a total) with `isTotal`.
export default function AccountCard({ row, columns, actions, linkAction, isTotal = false }) {
  const fieldColumns = columns.filter(
    (col) => col.id !== "icon" && col.id !== "url" && col.label && row[col.id] !== undefined && row[col.id] !== null
  );

  return (
    <Card
      sx={{
        backgroundColor: isTotal ? "#0f4c75" : "#243447",
        color: "#fff",
        borderRadius: 2,
        mb: 1.5,
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
      }}
    >
      {(actions || linkAction) && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", px: 1, pt: 0.5 }}>
          {linkAction}
          {actions}
        </Box>
      )}
      <CardContent sx={{ pt: actions || linkAction ? 0 : 2, "&:last-child": { pb: 2 } }}>
        {isTotal && (
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            Total
          </Typography>
        )}
        {fieldColumns.map((col, i) => {
          const value = row[col.id];
          const display = col.format && typeof value === "number" ? col.format(value) : value;
          return (
            <Box
              key={col.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
                py: 0.75,
                borderBottom: i < fieldColumns.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
              }}
            >
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", flexShrink: 0 }}>
                {col.label.replace(/ /g, " ")}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: isTotal ? 700 : 600, textAlign: "right" }}>
                {display}
              </Typography>
            </Box>
          );
        })}
      </CardContent>
    </Card>
  );
}
