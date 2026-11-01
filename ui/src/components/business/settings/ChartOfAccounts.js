import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadBusinessAccounts } from "../../../state/businessAccountsSlice";
import BusinessTable from "../BusinessTable";
import SettingsHeader from "./SettingsHeader";
import AddAccountDialog from "./AddAccountDialog";
import EditAccountDialog from "./EditAccountDialog";
import { ACCOUNT_TYPE_LABELS } from "./settingsLabels";

const COLUMNS = [
  { id: "number", label: "Number", align: "left" },
  { id: "name", label: "Name", align: "left" },
  { id: "typeLabel", label: "Type", align: "left" },
  { id: "scheduleELine", label: "Schedule E Line", align: "right" },
  { id: "statusLabel", label: "Status", align: "left" },
];

export default function ChartOfAccounts() {
  const dispatch = useDispatch();
  const accounts = useSelector((state) => state.businessAccounts.items);
  const [isAdding, setIsAdding] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  useEffect(() => {
    dispatch(loadBusinessAccounts());
  }, [dispatch]);

  const rows = accounts.map((account) => ({
    ...account,
    typeLabel: ACCOUNT_TYPE_LABELS[account.type],
    statusLabel: account.isActive ? "Active" : "Inactive",
  }));

  return (
    <>
      <SettingsHeader title="Chart of Accounts" addLabel="Add account" onAdd={() => setIsAdding(true)} />
      <BusinessTable
        columns={COLUMNS}
        rows={rows}
        onEdit={setEditingAccount}
        isRowMuted={(row) => !row.isActive}
      />
      {isAdding && <AddAccountDialog onClose={() => setIsAdding(false)} />}
      {editingAccount && (
        <EditAccountDialog account={editingAccount} onClose={() => setEditingAccount(null)} />
      )}
    </>
  );
}
