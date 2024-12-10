import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import { useContext } from "react";
import { AppContext } from "../../../AppContext";
import axios from "axios";


export default function ConfirmDeleteAccountDialog({
  open,
  setOpen,
  row,
  setAccountsRefresh,
  accountsRefresh,
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
          `http://localhost:3001/bask`,
          payload
          );
          setSnackbarSuccess(true)
          setAccountsRefresh(!accountsRefresh)
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