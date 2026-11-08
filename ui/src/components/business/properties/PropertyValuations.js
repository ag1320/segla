import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Typography } from "@mui/material";
import { removeBusinessPropertyValuation } from "../../../state/businessPropertyValuationsSlice";
import BusinessTable from "../BusinessTable";
import SettingsHeader from "../settings/SettingsHeader";
import ValuationChart from "./ValuationChart";
import ValuationDialog from "./ValuationDialog";
import { VALUATION_SOURCE_LABELS } from "./propertyLabels";
import { formatCents, formatDate } from "../businessFormat";
import { MUTED_TEXT } from "../businessStyles";

const COLUMNS = [
  { id: "date", label: "Date", align: "left" },
  { id: "value", label: "Value", align: "right" },
  { id: "change", label: "Change", align: "right" },
  { id: "sourceLabel", label: "Source", align: "left" },
  { id: "note", label: "Note", align: "left" },
];

const formatChange = (cents) => `${cents >= 0 ? "+" : "−"}${formatCents(Math.abs(cents))}`;

// The property's market value over time. A chart once there are two points.
export default function PropertyValuations({ property }) {
  const dispatch = useDispatch();
  const valuations = useSelector((state) =>
    state.businessPropertyValuations.propertyId === property.id ? state.businessPropertyValuations.items : []
  );
  const [isAdding, setIsAdding] = useState(false);
  const [editingValuation, setEditingValuation] = useState(null);
  const [error, setError] = useState(null);

  const handleDelete = async (valuation) => {
    try {
      await dispatch(removeBusinessPropertyValuation({ id: valuation.id, propertyId: property.id })).unwrap();
    } catch (message) {
      setError(message);
    }
  };

  const rows = valuations
    .map((valuation, index) => ({
      ...valuation,
      name: `valuation on ${valuation.valuationDate}`,
      date: formatDate(valuation.valuationDate),
      value: formatCents(valuation.valueCents),
      change: index === 0 ? null : formatChange(valuation.valueCents - valuations[index - 1].valueCents),
      sourceLabel: VALUATION_SOURCE_LABELS[valuation.source],
    }))
    .reverse();

  return (
    <>
      <SettingsHeader title="Valuations" addLabel="Add valuation" onAdd={() => setIsAdding(true)} />
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {valuations.length >= 2 && <ValuationChart valuations={valuations} />}
      {rows.length === 0 ? (
        <Typography color={MUTED_TEXT}>No valuations yet.</Typography>
      ) : (
        <BusinessTable columns={COLUMNS} rows={rows} onEdit={setEditingValuation} onDelete={handleDelete} />
      )}
      {isAdding && <ValuationDialog propertyId={property.id} valuation={null} onClose={() => setIsAdding(false)} />}
      {editingValuation && (
        <ValuationDialog
          propertyId={property.id}
          valuation={editingValuation}
          onClose={() => setEditingValuation(null)}
        />
      )}
    </>
  );
}
