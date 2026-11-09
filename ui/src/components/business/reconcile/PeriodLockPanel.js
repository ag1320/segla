import { useState } from "react";
import { useSelector } from "react-redux";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { Box, Button, Paper, Typography } from "@mui/material";
import LockBooksDialog from "./LockBooksDialog";
import { formatDate } from "../businessFormat";
import { MUTED_TEXT } from "../businessStyles";

export default function PeriodLockPanel({ entityId }) {
  const lockedThroughDate = useSelector(
    (state) => state.businessPeriodLocks.lockedThroughDateByEntityId[entityId] ?? null
  );
  const [isChanging, setIsChanging] = useState(false);

  return (
    <>
      <Typography variant="h6" color="white" sx={{ mt: 3, mb: 1.5 }}>
        Month Lock
      </Typography>
      <Paper sx={{ p: 2, backgroundColor: "#1b262c", color: "white" }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {lockedThroughDate ? <LockIcon /> : <LockOpenIcon sx={{ color: MUTED_TEXT }} />}
            <Typography>
              {lockedThroughDate
                ? `Books locked through ${formatDate(lockedThroughDate)}`
                : "No months are locked yet"}
            </Typography>
          </Box>
          <Button variant="contained" onClick={() => setIsChanging(true)} sx={{ backgroundColor: "#0f4c75" }}>
            Change lock
          </Button>
        </Box>
      </Paper>
      {isChanging && (
        <LockBooksDialog
          entityId={entityId}
          lockedThroughDate={lockedThroughDate}
          onClose={() => setIsChanging(false)}
        />
      )}
    </>
  );
}
