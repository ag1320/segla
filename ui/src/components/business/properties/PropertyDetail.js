import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink, Navigate, Route, Routes, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import { Box, Button, Chip, Typography } from "@mui/material";
import { loadBusinessProperties } from "../../../state/businessPropertiesSlice";
import { loadBusinessEntities } from "../../../state/businessEntitiesSlice";
import { loadBusinessPropertyValuations } from "../../../state/businessPropertyValuationsSlice";
import BusinessTabs from "../BusinessTabs";
import PropertyDialog from "./PropertyDialog";
import PropertyOverview from "./PropertyOverview";
import PropertyValuations from "./PropertyValuations";
import { PROPERTY_STATUS_LABELS } from "../settings/settingsLabels";
import { MUTED_TEXT } from "../businessStyles";

// One property, with a tab per topic. Loan, fixed assets, leases and the
// capex plan join these tabs in later steps.
export default function PropertyDetail() {
  const dispatch = useDispatch();
  const propertyId = Number(useParams().propertyId);
  const property = useSelector((state) =>
    state.businessProperties.items.find((item) => item.id === propertyId)
  );
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    dispatch(loadBusinessProperties());
    dispatch(loadBusinessEntities());
    dispatch(loadBusinessPropertyValuations(propertyId));
  }, [dispatch, propertyId]);

  if (!property) {
    return <Typography color={MUTED_TEXT}>Loading…</Typography>;
  }

  const basePath = `/business/properties/${propertyId}`;
  const tabs = [
    { label: "Overview", path: `${basePath}/overview` },
    { label: "Valuations", path: `${basePath}/valuations` },
  ];

  return (
    <>
      <Button
        component={RouterLink}
        to="/business/properties"
        startIcon={<ArrowBackIcon />}
        size="small"
        sx={{ color: MUTED_TEXT, mb: 1 }}
      >
        Properties
      </Button>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5, mb: 1 }}>
        <Typography variant="h6" color="white">
          {property.name}
        </Typography>
        <Chip
          size="small"
          variant="outlined"
          label={PROPERTY_STATUS_LABELS[property.status]}
          sx={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}
        />
        <Button
          size="small"
          startIcon={<EditIcon />}
          onClick={() => setIsEditing(true)}
          sx={{ color: "white", ml: "auto" }}
        >
          Edit
        </Button>
      </Box>
      <BusinessTabs tabs={tabs} />
      <Box sx={{ mt: 2 }}>
        <Routes>
          <Route index element={<Navigate to={`${basePath}/overview`} replace />} />
          <Route path="overview" element={<PropertyOverview property={property} />} />
          <Route path="valuations" element={<PropertyValuations property={property} />} />
        </Routes>
      </Box>
      {isEditing && <PropertyDialog property={property} onClose={() => setIsEditing(false)} />}
    </>
  );
}
