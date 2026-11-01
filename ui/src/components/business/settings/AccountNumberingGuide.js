import { useState } from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  IconButton,
  Popover,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

const NUMBER_RANGES = [
  { range: "1000s", type: "Assets", example: "1000 Chase Business Checking" },
  { range: "2000s", type: "Liabilities", example: "2000 WF Signify Business Card" },
  { range: "3000s", type: "Equity", example: "3100 Owner Draws" },
  { range: "4000s", type: "Income", example: "4000 Rental Income" },
  { range: "5000s", type: "Expenses", example: "5090 Repairs" },
];

export default function AccountNumberingGuide() {
  const [anchor, setAnchor] = useState(null);

  return (
    <>
      <IconButton
        size="small"
        onClick={(event) => setAnchor(event.currentTarget)}
        aria-label="how account numbers work"
        sx={{ color: "rgba(255,255,255,0.6)" }}
      >
        <InfoOutlinedIcon fontSize="small" />
      </IconButton>
      <Popover
        open={anchor !== null}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, pt: 1.5 }}>
          Account numbers are filing codes, grouped by type
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Range</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Example</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {NUMBER_RANGES.map((row) => (
              <TableRow key={row.range}>
                <TableCell>{row.range}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>{row.example}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Popover>
    </>
  );
}
