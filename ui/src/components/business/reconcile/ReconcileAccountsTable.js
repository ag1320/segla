import { useSelector } from "react-redux";
import UndoIcon from "@mui/icons-material/Undo";
import {
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import { formatCents, formatDate } from "../businessFormat";
import { TABLE_PAPER_SX, TABLE_CONTAINER_SX, HEADER_CELL_SX, CELL_SX, MUTED_TEXT } from "../businessStyles";

// One row per active bank or card account, with its latest reconciled
// statement. onUndo(reconciliation) undoes that latest one.
export default function ReconcileAccountsTable({ onReconcile, onUndo }) {
  const bankAccounts = useSelector((state) => state.businessBankAccounts.items);
  const reconciliations = useSelector((state) => state.businessReconciliations.items);
  const activeAccounts = bankAccounts.filter((bankAccount) => bankAccount.isActive);
  // Newest first, so the first match is the latest.
  const latestFor = (bankAccountId) => reconciliations.find((item) => item.bankAccountId === bankAccountId);

  return (
    <Paper sx={{ ...TABLE_PAPER_SX, mb: 3 }}>
      <TableContainer sx={TABLE_CONTAINER_SX}>
        <Table size="small" sx={{ minWidth: 600 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={HEADER_CELL_SX}>Account</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Reconciled Through</TableCell>
              <TableCell sx={HEADER_CELL_SX} align="right">Statement Balance</TableCell>
              <TableCell sx={HEADER_CELL_SX} />
            </TableRow>
          </TableHead>
          <TableBody>
            {activeAccounts.map((bankAccount) => {
              const latest = latestFor(bankAccount.id);
              return (
                <TableRow hover key={bankAccount.id}>
                  <TableCell sx={CELL_SX}>{bankAccount.name}</TableCell>
                  <TableCell sx={{ ...CELL_SX, color: latest ? "white" : MUTED_TEXT }}>
                    {latest ? formatDate(latest.statementDate) : "Never"}
                  </TableCell>
                  <TableCell sx={CELL_SX} align="right">
                    {latest ? formatCents(latest.statementBalanceCents) : "—"}
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                    <Button size="small" onClick={() => onReconcile(bankAccount)} sx={{ color: "#BBE1FA" }}>
                      Reconcile
                    </Button>
                    {latest && (
                      <Tooltip title="Undo the latest reconciliation">
                        <IconButton size="small" onClick={() => onUndo(latest)} aria-label="undo reconciliation">
                          <UndoIcon fontSize="small" sx={{ fill: "white" }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
