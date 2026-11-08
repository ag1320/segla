import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import { Link, Typography } from "@mui/material";
import { loadBusinessProperties } from "../../../state/businessPropertiesSlice";
import { loadBusinessEntities } from "../../../state/businessEntitiesSlice";
import BusinessTable from "../BusinessTable";
import SettingsHeader from "../settings/SettingsHeader";
import PropertyDialog from "./PropertyDialog";
import { PROPERTY_STATUS_LABELS } from "../settings/settingsLabels";
import { formatDate } from "../businessFormat";
import { MUTED_TEXT } from "../businessStyles";

const COLUMNS = [
  { id: "nameLink", label: "Name", align: "left" },
  { id: "address", label: "Address", align: "left" },
  { id: "statusLabel", label: "Status", align: "left" },
  { id: "targetConversion", label: "Target Conversion", align: "left" },
  { id: "placedInService", label: "Placed in Service", align: "left" },
];

const formatOptionalDate = (value) => (value === null ? null : formatDate(value));

export default function PropertyList() {
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
    nameLink: (
      <Link component={RouterLink} to={`/business/properties/${property.id}`} sx={{ color: "#BBE1FA" }}>
        {property.name}
      </Link>
    ),
    statusLabel: PROPERTY_STATUS_LABELS[property.status],
    targetConversion: formatOptionalDate(property.targetConversionDate),
    placedInService: formatOptionalDate(property.placedInServiceDate),
  }));

  return (
    <>
      <SettingsHeader title="Properties" addLabel="Add property" onAdd={() => setIsAdding(true)} />
      {rows.length === 0 ? (
        <Typography color={MUTED_TEXT}>No properties yet.</Typography>
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
