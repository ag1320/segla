import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
} from "@mui/material";

export default function ConfirmExportDialog({
  open,
  setOpen,
  onConfirm,
}) {
  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="confirm-dialog"
    >
      <DialogTitle id="confirm-dialog">
        It looks like this budget was already exported. Are you sure you want to export again?
      </DialogTitle>
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
            onConfirm(true);
          }}
          sx={{ backgroundColor: "#0f4c75" }}
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
