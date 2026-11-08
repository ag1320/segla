import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Typography } from "@mui/material";
import { loadBusinessRules, removeBusinessRule } from "../../../state/businessRulesSlice";
import { loadBusinessAccounts } from "../../../state/businessAccountsSlice";
import { loadBusinessProperties } from "../../../state/businessPropertiesSlice";
import { loadBusinessVendors } from "../../../state/businessVendorsSlice";
import BusinessTable from "../BusinessTable";
import SettingsHeader from "./SettingsHeader";
import RuleDialog from "./RuleDialog";
import useLedgerLookups from "../ledger/useLedgerLookups";
import { MUTED_TEXT } from "../businessStyles";

const COLUMNS = [
  { id: "descriptionPattern", label: "Description Contains", align: "left" },
  { id: "categoryLabel", label: "Category", align: "left" },
  { id: "propertyLabel", label: "Property", align: "left" },
  { id: "vendorLabel", label: "Vendor", align: "left" },
];

export default function Rules() {
  const dispatch = useDispatch();
  const rules = useSelector((state) => state.businessRules.items);
  const { accountLabel, propertyLabel, vendorLabel } = useLedgerLookups();
  const [isAdding, setIsAdding] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    dispatch(loadBusinessRules());
    dispatch(loadBusinessAccounts());
    dispatch(loadBusinessProperties());
    dispatch(loadBusinessVendors());
  }, [dispatch]);

  const handleDelete = async (rule) => {
    try {
      await dispatch(removeBusinessRule(rule.id)).unwrap();
    } catch (message) {
      setError(message);
    }
  };

  const rows = rules.map((rule) => ({
    ...rule,
    name: rule.descriptionPattern,
    categoryLabel: accountLabel(rule.accountId),
    propertyLabel: propertyLabel(rule.propertyId),
    vendorLabel: vendorLabel(rule.vendorId),
  }));

  return (
    <>
      <SettingsHeader title="Rules" addLabel="Add rule" onAdd={() => setIsAdding(true)} />
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {rows.length === 0 ? (
        <Typography color={MUTED_TEXT}>No rules yet.</Typography>
      ) : (
        <BusinessTable columns={COLUMNS} rows={rows} onEdit={setEditingRule} onDelete={handleDelete} />
      )}
      {isAdding && <RuleDialog rule={null} onClose={() => setIsAdding(false)} />}
      {editingRule && <RuleDialog rule={editingRule} onClose={() => setEditingRule(null)} />}
    </>
  );
}
