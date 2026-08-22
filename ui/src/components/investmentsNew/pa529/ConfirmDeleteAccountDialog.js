import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import { useDispatch } from "react-redux";
import { removePa529 } from "../../../state/pa529Slice";
import { setSnackbarSuccess, setSnackbarError } from "../../../state/uiSlice";

export default function ConfirmDeleteAccountDialog({
  open,
  setOpen,
  row,
  setCurrentRow,
}) {
  const dispatch = useDispatch();

  const onConfirm = () => {
    dispatch(removePa529(row.id))
      .unwrap()
      .then(() => dispatch(setSnackbarSuccess(true)))
      .catch(() => dispatch(setSnackbarError(true)))
      .finally(() => setCurrentRow({}));
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="confirm-dialog"
    >
      <DialogTitle id="confirm-dialog">
        {`Are you sure you want to delete ${row.beneficiary}'s 529 with $${row.value}?`}
      </DialogTitle>
      <DialogActions>
        <Button
          variant="contained"
          onClick={() => {
            setOpen(false)
            setCurrentRow({})
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
}
