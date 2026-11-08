import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Box, MenuItem, TextField, Typography } from "@mui/material";
import {
  loadBusinessBankTransactions,
  changeBusinessBankTransactionStatus,
} from "../../../state/businessBankTransactionsSlice";
import { loadBusinessBankAccounts } from "../../../state/businessBankAccountsSlice";
import { loadBusinessAccounts } from "../../../state/businessAccountsSlice";
import { loadBusinessProperties } from "../../../state/businessPropertiesSlice";
import ImportCsvButton from "./ImportCsvButton";
import InboxTable from "./InboxTable";
import CategorizeDialog from "./CategorizeDialog";
import { DARK_FIELD_SX, MUTED_TEXT } from "../businessStyles";

const EMPTY_MESSAGES = {
  new: "Nothing to categorize. Import a CSV to bring in new transactions.",
  excluded: "No excluded transactions.",
};

export default function Inbox() {
  const dispatch = useDispatch();
  const bankAccounts = useSelector((state) => state.businessBankAccounts.items);
  const transactions = useSelector((state) => state.businessBankTransactions.items);
  const status = useSelector((state) => state.businessBankTransactions.status);
  const [notice, setNotice] = useState(null);
  const [categorizing, setCategorizing] = useState(null);
  const importableAccounts = bankAccounts.filter((bankAccount) => bankAccount.importFormat && bankAccount.isActive);

  useEffect(() => {
    dispatch(loadBusinessBankAccounts());
    dispatch(loadBusinessAccounts());
    dispatch(loadBusinessProperties());
    dispatch(loadBusinessBankTransactions({ status: "new" }));
  }, [dispatch]);

  const handleChangeStatus = async (transaction, newStatus) => {
    try {
      await dispatch(changeBusinessBankTransactionStatus({ id: transaction.id, status: newStatus })).unwrap();
    } catch (message) {
      setNotice({ severity: "error", text: message });
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2 }}>
        <TextField
          select
          size="small"
          label="Show"
          value={status}
          onChange={(event) => dispatch(loadBusinessBankTransactions({ status: event.target.value }))}
          sx={{ ...DARK_FIELD_SX, minWidth: 200 }}
        >
          <MenuItem value="new">To categorize</MenuItem>
          <MenuItem value="excluded">Excluded</MenuItem>
        </TextField>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {importableAccounts.map((bankAccount) => (
            <ImportCsvButton key={bankAccount.id} bankAccount={bankAccount} onResult={setNotice} />
          ))}
        </Box>
      </Box>

      {notice && (
        <Alert severity={notice.severity} onClose={() => setNotice(null)} sx={{ mb: 2 }}>
          {notice.text}
        </Alert>
      )}

      {transactions.length === 0 ? (
        <Typography color={MUTED_TEXT}>{EMPTY_MESSAGES[status]}</Typography>
      ) : (
        <InboxTable onCategorize={setCategorizing} onChangeStatus={handleChangeStatus} />
      )}

      {categorizing && (
        <CategorizeDialog transaction={categorizing} onClose={() => setCategorizing(null)} />
      )}
    </>
  );
}
