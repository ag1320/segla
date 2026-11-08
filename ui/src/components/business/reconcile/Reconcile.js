import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Typography } from "@mui/material";
import { loadBusinessBankAccounts } from "../../../state/businessBankAccountsSlice";
import { loadBusinessAccounts } from "../../../state/businessAccountsSlice";
import { loadBusinessEntities } from "../../../state/businessEntitiesSlice";
import {
  loadBusinessReconciliations,
  undoBusinessReconciliation,
} from "../../../state/businessReconciliationsSlice";
import { loadBusinessPeriodLock } from "../../../state/businessPeriodLocksSlice";
import ReconcileAccountsTable from "./ReconcileAccountsTable";
import ReconcileDialog from "./ReconcileDialog";
import PeriodLockPanel from "./PeriodLockPanel";

export default function Reconcile() {
  const dispatch = useDispatch();
  const entityId = useSelector((state) => state.businessEntities.items[0]?.id);
  const [reconciling, setReconciling] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    dispatch(loadBusinessBankAccounts());
    dispatch(loadBusinessAccounts());
    dispatch(loadBusinessEntities());
    dispatch(loadBusinessReconciliations());
  }, [dispatch]);

  useEffect(() => {
    if (entityId) dispatch(loadBusinessPeriodLock(entityId));
  }, [dispatch, entityId]);

  const handleUndo = async (reconciliation) => {
    try {
      await dispatch(undoBusinessReconciliation(reconciliation.id)).unwrap();
    } catch (message) {
      setError(message);
    }
  };

  return (
    <>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Typography variant="h6" color="white" sx={{ mb: 1.5 }}>
        Statements
      </Typography>
      <ReconcileAccountsTable onReconcile={setReconciling} onUndo={handleUndo} />
      {entityId && <PeriodLockPanel entityId={entityId} />}
      {reconciling && <ReconcileDialog bankAccount={reconciling} onClose={() => setReconciling(null)} />}
    </>
  );
}
