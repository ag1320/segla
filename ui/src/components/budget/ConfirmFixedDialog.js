import { formatFixedExpenses } from "./FixedExpensesFuncs";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Divider,
} from "@mui/material";
import { useContext } from "react";
import { AppContext } from "../../AppContext";

const ConfirmFixedDialog = ({ open, setOpen, fixedExpenses, onConfirm }) => {
  let formattedExpenses = formatFixedExpenses(fixedExpenses);
  let { setDate } = useContext(AppContext);
  let { setReason } = useContext(AppContext);
  let { setOpenInstructions } = useContext(AppContext);

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="confirm-dialog"
      sx={{
        "& .MuiDialog-container": {
          "& .MuiPaper-root": {
            width: "100%",
            maxWidth: "600px",
          },
        },
      }}
    >
      <DialogTitle id="confirm-dialog">Confirm Fixed Expenses</DialogTitle>
      <DialogContent>
        <p>Do these fixed monthly expenses look correct?</p>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={6}>
            Category
          </Grid>
          <Grid item xs={2} zeroMinWidth>
            Aaron
          </Grid>
          <Grid item xs={2} zeroMinWidth>
            Jen
          </Grid>
          <Grid item xs={2} zeroMinWidth>
            Subtotal
          </Grid>
        </Grid>
        <Divider />
        {formattedExpenses.map((item, id) => {
          return (
            <Grid container spacing={2} justifyContent="center" key={id}>
              <Grid item xs={6}>
                {item.category}
              </Grid>
              <Grid item xs={2} zeroMinWidth>
                $ {item.aaron.toFixed(2)}
              </Grid>
              <Grid item xs={2} zeroMinWidth>
                $ {item.jen.toFixed(2)}
              </Grid>
              <Grid item xs={2} zeroMinWidth>
                $ {item.subtotal.toFixed(2)}
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

export default ConfirmFixedDialog;
