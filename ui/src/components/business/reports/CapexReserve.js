import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { loadBusinessCapexPlan, saveBusinessCapexReserveAccount } from "../../../state/businessCapexSlice";
import { loadBusinessAccounts } from "../../../state/businessAccountsSlice";
import PropertyTile from "../properties/PropertyTile";
import ReportActions from "./ReportActions";
import PrintHeader from "./PrintHeader";
import { csvAmount } from "./reportCsv";
import { formatCents, formatDate } from "../businessFormat";
import { TABLE_PAPER_SX, HEADER_CELL_SX, CELL_SX, DARK_FIELD_SX, MUTED_TEXT } from "../businessStyles";

const isCashAccount = (account) => account.number >= 1000 && account.number <= 1099;

// Every property's components against the reserve: how funded it is today
// and the next ten years of replacements.
export default function CapexReserve({ entityId }) {
  const dispatch = useDispatch();
  const plan = useSelector((state) => state.businessCapex.plan);
  const accounts = useSelector((state) => state.businessAccounts.items);
  const [error, setError] = useState(null);

  useEffect(() => {
    dispatch(loadBusinessAccounts());
    dispatch(loadBusinessCapexPlan(entityId));
  }, [dispatch, entityId]);

  const handleAccount = async (event) => {
    try {
      await dispatch(saveBusinessCapexReserveAccount({ entityId, accountId: event.target.value })).unwrap();
      setError(null);
    } catch (message) {
      setError(message);
    }
  };

  if (!plan) return null;

  const subtitle = `As of ${formatDate(plan.asOfDate)}`;
  const csvRows = () => [
    ["Year", "Replacements", "Cost", "Projected reserve"],
    ...plan.forecast.map((year) => [
      year.year,
      year.components.map((component) => component.name).join("; "),
      csvAmount(year.replacementsCents),
      csvAmount(year.projectedReserveCents),
    ]),
  ];

  return (
    <>
      <Box className="no-print" sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, mb: 2 }}>
        <TextField
          select
          size="small"
          label="Reserve account"
          value={plan.reserveAccountId ?? ""}
          onChange={handleAccount}
          SelectProps={{ displayEmpty: true }}
          InputLabelProps={{ shrink: true }}
          sx={{ ...DARK_FIELD_SX, minWidth: 260 }}
        >
          <MenuItem value="">None yet</MenuItem>
          {accounts.filter(isCashAccount).map((account) => (
            <MenuItem key={account.id} value={account.id}>
              {`${account.number} ${account.name}`}
            </MenuItem>
          ))}
        </TextField>
        <ReportActions title="CapEx Reserve" subtitle={subtitle} fileName={`capex-reserve_${plan.asOfDate}.csv`} getCsvRows={csvRows} />
      </Box>
      {error && (
        <Alert className="no-print" severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <PrintHeader title="CapEx Reserve" subtitle={subtitle} />
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <PropertyTile label="Reserve" value={plan.reserveCents === null ? "—" : formatCents(plan.reserveCents)} caption="Balance in the books" />
        <PropertyTile label="Target" value={formatCents(plan.targetCents)} caption="Cost × age ÷ life" />
        <PropertyTile
          label="Funded"
          value={plan.fundedRatio === null ? "—" : `${(plan.fundedRatio * 100).toFixed(0)}%`}
          caption="Reserve ÷ target"
        />
        <PropertyTile label="Set aside yearly" value={formatCents(plan.annualContributionCents)} caption="Cost ÷ life" />
      </Box>
      <Paper sx={TABLE_PAPER_SX}>
        <TableContainer>
          <Table size="small" sx={{ minWidth: 640 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={HEADER_CELL_SX}>Year</TableCell>
                <TableCell sx={HEADER_CELL_SX}>Replacements</TableCell>
                <TableCell sx={HEADER_CELL_SX} align="right">Cost</TableCell>
                <TableCell sx={HEADER_CELL_SX} align="right">Projected reserve</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {plan.forecast.map((year) => (
                <TableRow key={year.year}>
                  <TableCell sx={CELL_SX}>{year.year}</TableCell>
                  <TableCell sx={{ ...CELL_SX, color: year.components.length ? "white" : MUTED_TEXT }}>
                    {year.components.length ? year.components.map((component) => component.name).join(", ") : "—"}
                  </TableCell>
                  <TableCell sx={CELL_SX} align="right">{year.replacementsCents ? formatCents(year.replacementsCents) : "—"}</TableCell>
                  <TableCell sx={{ ...CELL_SX, color: year.projectedReserveCents < 0 ? "#f95d6a" : "white" }} align="right">
                    {formatCents(year.projectedReserveCents)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
}
