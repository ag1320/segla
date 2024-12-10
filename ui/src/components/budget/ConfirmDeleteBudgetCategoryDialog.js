import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

export default function ConfirmDeleteBudgetCategoryDialog({
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
        Are you sure you want to delete the {currentRow.category?.toLowerCase()} budget category?
      </DialogTitle>
      <DialogContent>
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