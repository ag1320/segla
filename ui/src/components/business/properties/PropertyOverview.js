import { useSelector } from "react-redux";
import { Box, Paper, Table, TableBody, TableCell, TableRow } from "@mui/material";
import PropertyTile from "./PropertyTile";
import { PROPERTY_STATUS_LABELS } from "../settings/settingsLabels";
import { VALUATION_SOURCE_LABELS } from "./propertyLabels";
import { formatCents, formatDate } from "../businessFormat";
import { TABLE_PAPER_SX, CELL_SX, MUTED_TEXT } from "../businessStyles";

const LABEL_CELL_SX = { ...CELL_SX, color: MUTED_TEXT, width: 200 };

const orDash = (value, format) => (value === null ? "—" : format(value));

export default function PropertyOverview({ property }) {
  const valuations = useSelector((state) =>
    state.businessPropertyValuations.propertyId === property.id ? state.businessPropertyValuations.items : []
  );
  const latest = valuations.length > 0 ? valuations[valuations.length - 1] : null;
  const hasBasis = property.landBasisCents !== null || property.buildingBasisCents !== null;
  const basisCents = (property.landBasisCents ?? 0) + (property.buildingBasisCents ?? 0);

  const details = [
    ["Address", property.address ?? "—"],
    ["Status", PROPERTY_STATUS_LABELS[property.status]],
    ["Target conversion", orDash(property.targetConversionDate, formatDate)],
    ["Placed in service", orDash(property.placedInServiceDate, formatDate)],
    ["Land basis", orDash(property.landBasisCents, formatCents)],
    ["Building basis", orDash(property.buildingBasisCents, formatCents)],
  ];

  return (
    <>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <PropertyTile
          label="Market value"
          value={latest ? formatCents(latest.valueCents) : "—"}
          caption={
            latest
              ? `${formatDate(latest.valuationDate)} · ${VALUATION_SOURCE_LABELS[latest.source]}`
              : "No valuations yet"
          }
          tooltip="An estimate only. The books carry the property at cost."
        />
        <PropertyTile
          label="Cost basis"
          value={hasBasis ? formatCents(basisCents) : "—"}
          caption={hasBasis ? "Land + building" : "Not set yet"}
        />
        <PropertyTile
          label="Value above cost"
          value={latest && hasBasis ? formatCents(latest.valueCents - basisCents) : "—"}
          caption="Market value − cost basis"
        />
      </Box>
      <Paper sx={{ ...TABLE_PAPER_SX, maxWidth: 560 }}>
        <Table size="small">
          <TableBody>
            {details.map(([label, value]) => (
              <TableRow key={label}>
                <TableCell sx={LABEL_CELL_SX}>{label}</TableCell>
                <TableCell sx={CELL_SX}>{value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}
