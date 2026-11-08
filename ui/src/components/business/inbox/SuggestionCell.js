import { useSelector } from "react-redux";
import { Box, Button, Typography } from "@mui/material";
import useLedgerLookups from "../ledger/useLedgerLookups";
import { MUTED_TEXT } from "../businessStyles";

const ACTION_SX = { color: "#BBE1FA", minWidth: 0 };

// A possible transfer wins over a rule: a card payment matched to its other
// side must not also be categorized.
export default function SuggestionCell({ transaction, onAccept, onMatch }) {
  const rules = useSelector((state) => state.businessRules.items);
  const { accountLabel, propertyLabel } = useLedgerLookups();
  const rule = rules.find((item) => item.id === transaction.suggestedRuleId);

  if (transaction.transferCandidateIds.length > 0) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="body2">Transfer</Typography>
        <Button size="small" onClick={() => onMatch(transaction)} sx={ACTION_SX}>
          Match
        </Button>
      </Box>
    );
  }
  if (rule) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="body2">
          {accountLabel(rule.accountId)}
          <Typography component="span" variant="body2" color={MUTED_TEXT}>
            {` · ${propertyLabel(rule.propertyId)}`}
          </Typography>
        </Typography>
        <Button size="small" onClick={() => onAccept(transaction, rule)} sx={ACTION_SX}>
          Accept
        </Button>
      </Box>
    );
  }
  return null;
}
