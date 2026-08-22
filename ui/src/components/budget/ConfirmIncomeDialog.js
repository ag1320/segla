import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { setDate, setReason, setOpenInstructions } from "../../state/budgetSlice";

const ConfirmIncomeDialog = ({ open, setOpen, income, onConfirm }) => {
  const dispatch = useDispatch();

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="confirm-dialog"
    >
      <DialogTitle id="confirm-dialog">Confirm Fixed Income</DialogTitle>
      <DialogContent>
        <p>Does this fixed monthly income look correct?</p>
        {income.map((item, id) => {
          return (
            <Grid container spacing={2} justifyContent="space-evenly" key={id}>
              <Grid item xs={6}>
                {item.name}
              </Grid>
              <Grid item xs={6}>
                ${item.amount}
              </Grid>
            </Grid>
          );
        })}
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={() => {
            dispatch(setReason("Budget"));
            dispatch(setDate(null));
            dispatch(setOpenInstructions(true));
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

export default ConfirmIncomeDialog;
