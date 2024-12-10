import { useState, useContext} from "react";
import { AppContext } from "../../../AppContext";
import axios from "axios";
import {
  Modal,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
} from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 1400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  textAlign: "center",
};

export default function AddAccountDialog({
  open,
  handleClose,
  endpoint,
  setAccountsRefresh,
  accountsRefresh,
}) {
  let [accountHolder, setAccountHolder] = useState("");
  let [accountType, setAccountType] = useState("");
  let [value, setValue] = useState(0);
  let { setSnackbarSuccess, setSnackbarError } = useContext(AppContext);

  const handleAccountHolderChange = (event) =>
    setAccountHolder(event.target.value);
  const handleAccountTypeChange = (event) => setAccountType(event.target.value);
  const handleValueChange = (event) => setValue(event.target.value);

  const handleModalClose = (event) => {
    setAccountHolder("");
    setAccountType("");
    setValue(0);
    handleClose();
  };

  const handleSubmit = () => {
    postAccount(accountHolder, accountType, value).then(() => {
      handleModalClose();
    });
  };

  function postAccount(accountHolder, accountType, value) {
    let payload = { accountHolder, accountType, value };
    async function postData(endpoint) {
      try{
        let res = await axios.post(endpoint, payload);
        setSnackbarSuccess(true)
        setAccountsRefresh(!accountsRefresh);
        return res.data;
      } catch (err){
        setSnackbarError(true)
      }
    }
    return postData(endpoint);
  }

  return (
    <>
      <Modal
        open={open}
        onClose={handleModalClose}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSubmit();
          }
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography component={"span"} id="modal-modal-title" variant="h6">
            Add a New Account
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField
                id="outlined-basic"
                label="Account Holder"
                variant="outlined"
                onChange={handleAccountHolderChange}
                value={accountHolder}
                placeholder="Enter an Account Holder"
                helperText="This person owns the account"
                autoFocus
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="outlined-basic"
                label="Account Type"
                variant="outlined"
                onChange={handleAccountTypeChange}
                value={accountType}
                placeholder="Enter an Account Type"
                helperText="410(k), IRA, Roth IRA, etc."
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="outlined-basic"
                label="Value"
                variant="outlined"
                onChange={handleValueChange}
                value={value}
                placeholder="Enter the account's current value"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSubmit}
                sx={{ backgroundColor: "#0f4c75" }}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </>
  );
}
