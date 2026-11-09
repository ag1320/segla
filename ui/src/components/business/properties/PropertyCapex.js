import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Box, Typography } from "@mui/material";
import { loadBusinessCapexPlan, removeBusinessCapexComponent } from "../../../state/businessCapexSlice";
import BusinessTable from "../BusinessTable";
import SettingsHeader from "../settings/SettingsHeader";
import PropertyTile from "./PropertyTile";
import CapexComponentDialog from "./CapexComponentDialog";
import { formatCents } from "../businessFormat";
import { MUTED_TEXT } from "../businessStyles";

const COLUMNS = [
  { id: "name", label: "Component", align: "left" },
  { id: "installYear", label: "Installed", align: "left" },
  { id: "life", label: "Life", align: "right" },
  { id: "age", label: "Age", align: "right" },
  { id: "nextReplacementYear", label: "Replace", align: "left" },
  { id: "cost", label: "Cost", align: "right" },
  { id: "target", label: "Target saved", align: "right" },
];

const sum = (items, field) => items.reduce((total, item) => total + item[field], 0);

// The property's components and what should be saved toward them.
export default function PropertyCapex({ property }) {
  const dispatch = useDispatch();
  const plan = useSelector((state) => state.businessCapex.plan);
  const [isAdding, setIsAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    dispatch(loadBusinessCapexPlan(property.entityId));
  }, [dispatch, property.entityId]);

  const components = plan ? plan.components.filter((component) => component.propertyId === property.id) : [];
  const next = [...components].sort((a, b) => a.nextReplacementYear - b.nextReplacementYear)[0];
  const rows = components.map((component) => ({
    ...component,
    life: `${component.usefulLifeYears} yrs`,
    age: `${component.ageYears} yrs`,
    cost: formatCents(component.replacementCostCents),
    target: formatCents(component.targetCents),
  }));

  const handleDelete = async (component) => {
    try {
      await dispatch(removeBusinessCapexComponent({ entityId: property.entityId, id: component.id })).unwrap();
    } catch (message) {
      setError(message);
    }
  };

  return (
    <>
      <SettingsHeader title="CapEx Plan" addLabel="Add component" onAdd={() => setIsAdding(true)} />
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {components.length === 0 ? (
        <Typography color={MUTED_TEXT}>No components yet.</Typography>
      ) : (
        <>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
            <PropertyTile label="Target saved" value={formatCents(sum(components, "targetCents"))} caption="Cost × age ÷ life" />
            <PropertyTile label="Set aside yearly" value={formatCents(sum(components, "annualContributionCents"))} caption="Cost ÷ life" />
            <PropertyTile label="Next replacement" value={next.nextReplacementYear} caption={`${next.name} · ${formatCents(next.replacementCostCents)}`} />
          </Box>
          <BusinessTable columns={COLUMNS} rows={rows} onEdit={setEditing} onDelete={handleDelete} />
        </>
      )}
      {isAdding && <CapexComponentDialog property={property} component={null} onClose={() => setIsAdding(false)} />}
      {editing && <CapexComponentDialog property={property} component={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
