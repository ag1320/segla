import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import { useContext } from "react";
import { AppContext } from "../../../AppContext";
import axios from "axios";

export default function ConfirmDeleteEquityDialog({
  open,
  setOpen,
  row,
  setEquityRefresh,
  equityRefresh,
  setCurrentRow
}) {


  let { setSnackbarSuccess, setSnackbarError } = useContext(AppContext);

  const onConfirm = () =>{
    async function deleteAccount(id) {
      let payload = {
        params: {
          id,
        },
      };
      try{
        let res = await axios.delete(
          `http://localhost:3001/equity`,
          payload
          );
          setSnackbarSuccess(true)
          setEquityRefresh(!equityRefresh)
          setCurrentRow({})
          return res.data;
      } catch (err){
        setSnackbarError(true)
        setCurrentRow({})
      }
    }
    deleteAccount(row.id);
  }

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="confirm-dialog"
    >
      <DialogTitle id="confirm-dialog">
        {`Are you sure you want to delete equity for the property at ${row.address}?`}
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