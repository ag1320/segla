import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, TextField, Typography } from "@mui/material";
import { loadBusinessGeneralLedger } from "../../../state/businessReportsSlice";
import GeneralLedgerAccount from "./GeneralLedgerAccount";
import { formatDate, todayDateString } from "../businessFormat";
import { DARK_FIELD_SX, MUTED_TEXT } from "../businessStyles";

const startOfYear = () => `${todayDateString().slice(0, 4)}-01-01`;

// Every account with activity in the period, one table each.
export default function GeneralLedger({ entityId }) {
  const dispatch = useDispatch();
  const generalLedger = useSelector((state) => state.businessReports.generalLedger);
  const [period, setPeriod] = useState({ from: startOfYear(), to: todayDateString() });

  useEffect(() => {
    dispatch(loadBusinessGeneralLedger({ entityId, from: startOfYear(), to: todayDateString() }));
  }, [dispatch, entityId]);

  const handleChange = (field) => (event) => {
    const next = { ...period, [field]: event.target.value };
    setPeriod(next);
    if (next.from && next.to) {
      dispatch(loadBusinessGeneralLedger({ entityId, ...next }));
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <TextField
          label="From"
          type="date"
          size="small"
          value={period.from}
          onChange={handleChange("from")}
          InputLabelProps={{ shrink: true }}
          sx={DARK_FIELD_SX}
        />
        <TextField
          label="To"
          type="date"
          size="small"
          value={period.to}
          onChange={handleChange("to")}
          InputLabelProps={{ shrink: true }}
          sx={DARK_FIELD_SX}
        />
      </Box>

      {generalLedger && generalLedger.accounts.length === 0 && (
        <Typography color={MUTED_TEXT}>
          {`No activity from ${formatDate(generalLedger.from)} to ${formatDate(generalLedger.to)}.`}
        </Typography>
      )}
      {generalLedger &&
        generalLedger.accounts.map((account) => (
          <GeneralLedgerAccount key={account.accountId} account={account} />
        ))}
    </>
  );
}
