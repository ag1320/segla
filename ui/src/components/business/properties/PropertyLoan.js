import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Typography } from "@mui/material";
import { loadBusinessMortgages, removeBusinessMortgage } from "../../../state/businessMortgagesSlice";
import SettingsHeader from "../settings/SettingsHeader";
import MortgageCard from "./MortgageCard";
import MortgageDialog from "./MortgageDialog";
import { MUTED_TEXT } from "../businessStyles";

export default function PropertyLoan({ property }) {
  const dispatch = useDispatch();
  const allMortgages = useSelector((state) => state.businessMortgages.items);
  const mortgages = allMortgages.filter((mortgage) => mortgage.propertyId === property.id);
  const [isAdding, setIsAdding] = useState(false);
  const [editingMortgage, setEditingMortgage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    dispatch(loadBusinessMortgages());
  }, [dispatch]);

  const handleDelete = async (mortgage) => {
    try {
      await dispatch(removeBusinessMortgage(mortgage.id)).unwrap();
    } catch (message) {
      setError(message);
    }
  };

  return (
    <>
      <SettingsHeader title="Mortgage" addLabel="Add mortgage" onAdd={() => setIsAdding(true)} />
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {mortgages.length === 0 && <Typography color={MUTED_TEXT}>No mortgage on this property.</Typography>}
      {mortgages.map((mortgage) => (
        <MortgageCard
          key={mortgage.id}
          mortgage={mortgage}
          onEdit={() => setEditingMortgage(mortgage)}
          onDelete={() => handleDelete(mortgage)}
        />
      ))}
      {isAdding && <MortgageDialog propertyId={property.id} mortgage={null} onClose={() => setIsAdding(false)} />}
      {editingMortgage && (
        <MortgageDialog
          propertyId={property.id}
          mortgage={editingMortgage}
          onClose={() => setEditingMortgage(null)}
        />
      )}
    </>
  );
}
