import EditIcon from "@mui/icons-material/Edit";
import { IconButton, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import { formatCents } from "../businessFormat";
import { CELL_SX, MUTED_TEXT } from "../businessStyles";

const LINE_CELL_SX = { ...CELL_SX, borderBottom: "1px solid rgba(255,255,255,0.06)" };
const LINE_HEADER_SX = { ...LINE_CELL_SX, color: MUTED_TEXT, fontSize: "0.75rem" };

// One asset's depreciation by tax year. Where the CPA's figure is in, it
// replaces the estimate.
export default function FixedAssetYears({ fixedAsset, onEditCpa }) {
  if (fixedAsset.years.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: MUTED_TEXT, py: 1 }}>
        Land isn't depreciated.
      </Typography>
    );
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={LINE_HEADER_SX}>Year</TableCell>
          <TableCell sx={LINE_HEADER_SX} align="right">Segla estimate</TableCell>
          <TableCell sx={LINE_HEADER_SX} align="right">CPA's figure</TableCell>
          <TableCell sx={LINE_HEADER_SX} align="right">Accumulated</TableCell>
          <TableCell sx={LINE_HEADER_SX} align="right">Book value</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {fixedAsset.years.map((year) => (
          <TableRow key={year.taxYear}>
            <TableCell sx={LINE_CELL_SX}>{year.taxYear}</TableCell>
            <TableCell
              sx={{ ...LINE_CELL_SX, color: year.cpaCents === null ? "white" : MUTED_TEXT }}
              align="right"
            >
              {formatCents(year.estimateCents)}
            </TableCell>
            <TableCell sx={LINE_CELL_SX} align="right">
              {year.cpaCents === null ? "—" : formatCents(year.cpaCents)}
              <Tooltip title="Enter the CPA's figure">
                <IconButton
                  size="small"
                  onClick={() => onEditCpa(year)}
                  aria-label={`enter the CPA's ${year.taxYear} figure`}
                  sx={{ ml: 0.5 }}
                >
                  <EditIcon sx={{ fill: "white" }} fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </TableCell>
            <TableCell sx={LINE_CELL_SX} align="right">{formatCents(year.accumulatedCents)}</TableCell>
            <TableCell sx={LINE_CELL_SX} align="right">{formatCents(year.bookValueCents)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
