import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
  } from "@mui/material";
  
  export default function ConfirmDeleteFixedIncomeDialog({
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
          Are you sure you want to delete this income source?
        </DialogTitle>
        <DialogContent>
          <Grid container justifyContent = 'center'>
            <Grid item xs={6}>
              <p>Source</p>
            </Grid>
            <Grid item xs={6}>
              <p>Amount</p>
            </Grid>
            <Grid item xs={6}>
              <p>{currentRow.source}</p>
            </Grid>
            <Grid item xs={6}>
              <p>{`$ ${currentRow.amount?.toFixed(2)}`}</p>
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
  