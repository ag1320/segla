import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { setDate, setReason } from "../../state/budgetSlice";

const NewBudgetDialog = ({ open, setOpen, month, year, onConfirm }) => {
  const dispatch = useDispatch();

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="confirm-dialog"
    >
      <DialogTitle id="confirm-dialog">
        You don't have any transactions yet
      </DialogTitle>
      <DialogContent>
        <p>
          Do you want to start a new budget for {month}, {year}?
        </p>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={() => {
            dispatch(setReason("Budget"));
            dispatch(setDate(null));
            setOpen(false);
          }}
          sx={{ backgroundColor: "#0f4c75" }}
        >
          No
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            setOpen(false);
            onConfirm();
          }}
          sx={{ backgroundColor: "#0f4c75" }}
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewBudgetDialog;
