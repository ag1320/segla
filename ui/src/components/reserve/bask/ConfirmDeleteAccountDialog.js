import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import { useDispatch } from "react-redux";
import { removeBask } from "../../../state/baskSlice";
import { setSnackbarSuccess, setSnackbarError } from "../../../state/uiSlice";

export default function ConfirmDeleteAccountDialog({
  open,
  setOpen,
  row,
  setCurrentRow,
}) {
  const dispatch = useDispatch();

  const onConfirm = () => {
    dispatch(removeBask(row.id))
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
        {`Are you sure you want to delete the reserve account with ${row.value}?`}
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
