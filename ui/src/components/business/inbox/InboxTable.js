import { useSelector } from "react-redux";
import BlockIcon from "@mui/icons-material/Block";
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
import SuggestionCell from "./SuggestionCell";
import { formatCents, formatDate } from "../businessFormat";
import { TABLE_PAPER_SX, TABLE_CONTAINER_SX, HEADER_CELL_SX, CELL_SX } from "../businessStyles";

const MONEY_IN_COLOR = "#81c784";

// onChangeStatus(transaction, "excluded" | "new") sets a transaction aside
// or brings it back. onAccept(transaction, rule) posts a rule's suggestion;
// onMatch(transaction) pairs a transfer.
export default function InboxTable({ onCategorize, onChangeStatus, onAccept, onMatch }) {
  const transactions = useSelector((state) => state.businessBankTransactions.items);
  const bankAccounts = useSelector((state) => state.businessBankAccounts.items);
  const isInbox = useSelector((state) => state.businessBankTransactions.status === "new");
  const bankAccountName = (id) => bankAccounts.find((bankAccount) => bankAccount.id === id)?.name ?? "";

  return (
    <Paper sx={TABLE_PAPER_SX}>
      <TableContainer sx={TABLE_CONTAINER_SX}>
        <Table size="small" sx={{ minWidth: 1000 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={HEADER_CELL_SX}>Date</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Account</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Description</TableCell>
              <TableCell sx={HEADER_CELL_SX} align="right">Amount</TableCell>
              {isInbox && <TableCell sx={HEADER_CELL_SX}>Suggestion</TableCell>}
              <TableCell sx={HEADER_CELL_SX} />
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow hover key={transaction.id}>
                <TableCell sx={{ ...CELL_SX, whiteSpace: "nowrap" }}>
                  {formatDate(transaction.transactionDate)}
                </TableCell>
                <TableCell sx={CELL_SX}>{bankAccountName(transaction.bankAccountId)}</TableCell>
                <TableCell sx={CELL_SX}>{transaction.description}</TableCell>
                <TableCell
                  sx={{ ...CELL_SX, color: transaction.amountCents > 0 ? MONEY_IN_COLOR : "white" }}
                  align="right"
                >
                  {formatCents(transaction.amountCents)}
                </TableCell>
                {isInbox && (
                  <TableCell sx={CELL_SX}>
                    <SuggestionCell transaction={transaction} onAccept={onAccept} onMatch={onMatch} />
                  </TableCell>
                )}
                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                  {transaction.status === "new" ? (
                    <>
                      <Button size="small" onClick={() => onCategorize(transaction)} sx={{ color: "#BBE1FA" }}>
                        Categorize
                      </Button>
                      <Tooltip title="Exclude (not a business transaction)">
                        <IconButton
                          size="small"
                          onClick={() => onChangeStatus(transaction, "excluded")}
                          aria-label="exclude transaction"
                        >
                          <BlockIcon fontSize="small" sx={{ fill: "white" }} />
                        </IconButton>
                      </Tooltip>
                    </>
                  ) : (
                    <Button size="small" onClick={() => onChangeStatus(transaction, "new")} sx={{ color: "#BBE1FA" }}>
                      Restore
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
