import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from "@mui/material";
import { useContext } from "react";
import { AppContext } from "../../AppContext";

const ConfirmIncomeDialog = ({ open, setOpen, income, onConfirm }) => {
  let { setDate } = useContext(AppContext);
  let { setReason } = useContext(AppContext);
  let { setOpenInstructions } = useContext(AppContext);

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
            setReason("Budget");
            setDate(null);
            setOpenInstructions(true);
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
