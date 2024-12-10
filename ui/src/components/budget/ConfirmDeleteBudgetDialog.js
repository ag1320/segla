import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";

export default function ConfirmDeleteBudgetDialog({
  open,
  setOpen,
  onConfirm,
  date,
}) {
  let month = date?.toLocaleString("EN-US", { month: "long" });
  let year = date?.getFullYear();

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="confirm-dialog"
    >
      {month === undefined ? (
        <>
          {" "}
          <DialogTitle id="confirm-dialog">
            {`Please select a date first!`}
          </DialogTitle>
          <DialogActions>
            <Button
              variant="contained"
              onClick={() => setOpen(false)}
              sx={{ backgroundColor: "#0f4c75" }}
            >
              OK
            </Button>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogTitle id="confirm-dialog">
            {`Are you sure you want to delete the budget for ${month} ${year}?`}
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
                onConfirm();
              }}
              sx={{ backgroundColor: "#0f4c75" }}
            >
              Yes
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
