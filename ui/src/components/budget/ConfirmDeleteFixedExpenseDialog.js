import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from "@mui/material";

export default function ConfirmDeleteFixedExpenseDialog({
  open,
  setOpen,
  onConfirm,
  currentRow,
}) {
  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="confirm-dialog"
    >
      <DialogTitle id="confirm-dialog">
        Are you sure you want to delete this expense?
      </DialogTitle>
      <DialogContent>
        <Grid container justifyContent = 'center'>
          <Grid item xs={4}>
            <p>Category</p>
          </Grid>
          <Grid item xs={4}>
            <p>Aaron</p>
          </Grid>
          <Grid item xs={4}>
            <p>Jen</p>
          </Grid>
          <Grid item xs={4}>
            <p>{currentRow.category}</p>
          </Grid>
          <Grid item xs={4}>
            <p>{currentRow.aaron}</p>
          </Grid>
          <Grid item xs={4}>
            <p>{currentRow.jen}</p>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={() => setOpen(false)}
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
}
