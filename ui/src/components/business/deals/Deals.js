import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Typography } from "@mui/material";
import { loadBusinessDeals, removeBusinessDeal } from "../../../state/businessDealsSlice";
import { loadBusinessEntities } from "../../../state/businessEntitiesSlice";
import BusinessTable from "../BusinessTable";
import SettingsHeader from "../settings/SettingsHeader";
import DealDialog from "./DealDialog";
import { formatCents } from "../businessFormat";
import { MUTED_TEXT } from "../businessStyles";

const COLUMNS = [
  { id: "name", label: "Deal", align: "left" },
  { id: "price", label: "Price", align: "right" },
  { id: "cashFlow", label: "Cash flow / mo", align: "right" },
  { id: "capRate", label: "Cap rate", align: "right" },
  { id: "cashOnCash", label: "Cash-on-cash", align: "right" },
  { id: "dscr", label: "DSCR", align: "right" },
];

const percent = (value) => (value === null ? "—" : `${(value * 100).toFixed(2)}%`);

// Properties under consideration, side by side.
export default function Deals() {
  const dispatch = useDispatch();
  const entityId = useSelector((state) => state.businessEntities.items[0]?.id);
  const deals = useSelector((state) => state.businessDeals.items);
  const [isAdding, setIsAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    dispatch(loadBusinessEntities());
  }, [dispatch]);

  useEffect(() => {
    if (entityId) dispatch(loadBusinessDeals(entityId));
  }, [dispatch, entityId]);

  const handleDelete = async (deal) => {
    try {
      await dispatch(removeBusinessDeal({ entityId, id: deal.id })).unwrap();
    } catch (message) {
      setError(message);
    }
  };

  const rows = deals.map((deal) => ({
    ...deal,
    price: formatCents(deal.inputs.purchasePriceCents),
    cashFlow: formatCents(deal.analysis.monthlyCashFlowCents),
    capRate: percent(deal.analysis.capRate),
    cashOnCash: percent(deal.analysis.cashOnCash),
    dscr: deal.analysis.dscr === null ? "—" : `${deal.analysis.dscr.toFixed(2)}×`,
  }));

  return (
    <>
      <SettingsHeader title="Deals" addLabel="New deal" onAdd={() => setIsAdding(true)} />
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {rows.length === 0 ? (
        <Typography color={MUTED_TEXT}>No deals yet.</Typography>
      ) : (
        <BusinessTable columns={COLUMNS} rows={rows} onEdit={setEditing} onDelete={handleDelete} />
      )}
      {isAdding && <DealDialog entityId={entityId} deal={null} onClose={() => setIsAdding(false)} />}
      {editing && <DealDialog entityId={entityId} deal={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
