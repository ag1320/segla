import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { setOpenInstructions } from "../../state/budgetSlice";

export default function InstructionsDialog() {

  const dispatch = useDispatch();
  const openInstructions = useSelector((state) => state.budget.openInstructions);

  return (
    <Dialog
      open={openInstructions}
      onClose={() => dispatch(setOpenInstructions(false))}
      aria-labelledby="confirm-dialog"
    >
      <DialogTitle id="confirm-dialog">
        Edit the Master Income/Expenses Lists Before Creating a New Budget
      </DialogTitle>
      <DialogContent>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={() => dispatch(setOpenInstructions(false))}
          sx={{ backgroundColor: "#0f4c75" }}
        >
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
}
