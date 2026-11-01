import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, MenuItem, TextField, Typography } from "@mui/material";
import { loadBusinessJournalEntries } from "../../../state/businessJournalEntriesSlice";
import { loadBusinessAccounts } from "../../../state/businessAccountsSlice";
import { loadBusinessProperties } from "../../../state/businessPropertiesSlice";
import { loadBusinessEntities } from "../../../state/businessEntitiesSlice";
import JournalView from "./JournalView";
import AccountRegister from "./AccountRegister";
import JournalEntryDialog from "./JournalEntryDialog";
import ReverseEntryDialog from "./ReverseEntryDialog";
import { DARK_FIELD_SX, MUTED_TEXT } from "../businessStyles";

export default function Ledger() {
  const dispatch = useDispatch();
  const accounts = useSelector((state) => state.businessAccounts.items);
  const entries = useSelector((state) => state.businessJournalEntries.items);
  const accountId = useSelector((state) => state.businessJournalEntries.accountId);
  const [isAdding, setIsAdding] = useState(false);
  const [reversingEntry, setReversingEntry] = useState(null);

  useEffect(() => {
    dispatch(loadBusinessAccounts());
    dispatch(loadBusinessProperties());
    dispatch(loadBusinessEntities());
    dispatch(loadBusinessJournalEntries({ accountId: null }));
  }, [dispatch]);

  const handleAccountChange = (event) => {
    const value = event.target.value;
    dispatch(loadBusinessJournalEntries({ accountId: value === "" ? null : value }));
  };

  return (
    <>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2 }}>
        <TextField
          select
          size="small"
          label="Account"
          value={accountId ?? ""}
          onChange={handleAccountChange}
          sx={{ ...DARK_FIELD_SX, minWidth: 300 }}
        >
          <MenuItem value="">All accounts</MenuItem>
          {accounts.map((account) => (
            <MenuItem key={account.id} value={account.id}>
              {`${account.number} ${account.name}`}
            </MenuItem>
          ))}
        </TextField>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAdding(true)}
          sx={{ backgroundColor: "#0f4c75" }}
        >
          New entry
        </Button>
      </Box>

      {entries.length === 0 ? (
        <Typography color={MUTED_TEXT}>No entries yet.</Typography>
      ) : accountId === null ? (
        <JournalView onReverse={setReversingEntry} />
      ) : (
        <AccountRegister accountId={accountId} onReverse={setReversingEntry} />
      )}

      {isAdding && <JournalEntryDialog onClose={() => setIsAdding(false)} />}
      {reversingEntry && (
        <ReverseEntryDialog entry={reversingEntry} onClose={() => setReversingEntry(null)} />
      )}
    </>
  );
}
