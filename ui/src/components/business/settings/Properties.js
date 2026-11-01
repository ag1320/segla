import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Typography } from "@mui/material";
import { loadBusinessProperties } from "../../../state/businessPropertiesSlice";
import { loadBusinessEntities } from "../../../state/businessEntitiesSlice";
import BusinessTable from "../BusinessTable";
import SettingsHeader from "./SettingsHeader";
import PropertyDialog from "./PropertyDialog";
import { PROPERTY_STATUS_LABELS } from "./settingsLabels";
import { formatCents, formatDate } from "../businessFormat";

const COLUMNS = [
  { id: "name", label: "Name", align: "left" },
  { id: "address", label: "Address", align: "left" },
  { id: "statusLabel", label: "Status", align: "left" },
  { id: "targetConversion", label: "Target Conversion", align: "left" },
  { id: "placedInService", label: "Placed in Service", align: "left" },
  { id: "landBasis", label: "Land Basis", align: "right" },
  { id: "buildingBasis", label: "Building Basis", align: "right" },
];

const formatOptional = (value, format) => (value === null ? null : format(value));

export default function Properties() {
  const dispatch = useDispatch();
  const properties = useSelector((state) => state.businessProperties.items);
  const [isAdding, setIsAdding] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  useEffect(() => {
    dispatch(loadBusinessProperties());
    dispatch(loadBusinessEntities());
  }, [dispatch]);

  const rows = properties.map((property) => ({
    ...property,
    statusLabel: PROPERTY_STATUS_LABELS[property.status],
    targetConversion: formatOptional(property.targetConversionDate, formatDate),
    placedInService: formatOptional(property.placedInServiceDate, formatDate),
    landBasis: formatOptional(property.landBasisCents, formatCents),
    buildingBasis: formatOptional(property.buildingBasisCents, formatCents),
  }));

  return (
    <>
      <SettingsHeader title="Properties" addLabel="Add property" onAdd={() => setIsAdding(true)} />
      {rows.length === 0 ? (
        <Typography color="rgba(255,255,255,0.6)">No properties yet.</Typography>
      ) : (
        <BusinessTable columns={COLUMNS} rows={rows} onEdit={setEditingProperty} />
      )}
      {isAdding && <PropertyDialog property={null} onClose={() => setIsAdding(false)} />}
      {editingProperty && (
        <PropertyDialog property={editingProperty} onClose={() => setEditingProperty(null)} />
      )}
    </>
  );
}
