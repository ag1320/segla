import { useState, useContext, useEffect} from "react";
import { AppContext } from "../../../AppContext";
import axios from "axios";
import {
  Modal,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  tablePaginationClasses,
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

export default function EditVanguardAccountDialog({
  open,
  handleClose,
  endpoint,
  setAccountsRefresh,
  accountsRefresh,
  row
}) {

  let [accountHolder, setAccountHolder] = useState("");
  let [accountType, setAccountType] = useState("");
  let [value, setValue] = useState(0);
  let [totalReturn, setTotalReturn] = useState(0);
  let [totalReturnPercentage, setTotalReturnPercentage] = useState(0);
  let [ytdReturnPercentage, setYtdReturnPercentage] = useState(0);

  let { setSnackbarSuccess, setSnackbarError } = useContext(AppContext);

  const handleAccountHolderChange = (event) =>
    setAccountHolder(event.target.value);
  const handleAccountTypeChange = (event) => setAccountType(event.target.value);
  const handleValueChange = (event) => setValue(event.target.value);
  const handleTotalReturnChange = (event) => setTotalReturn(event.target.value);
  const handleTotalReturnPercentageChange = (event) => setTotalReturnPercentage(event.target.value);
  const handleYtdReturnPercentageChange = (event) => setYtdReturnPercentage(event.target.value);

  const handleModalClose = (event) => {
    handleClose();
  };

  const handleSubmit = () => {
    patchAccount(accountHolder, accountType, value, totalReturn, totalReturnPercentage, ytdReturnPercentage, row.id).then(() => {
      handleModalClose();
    });
  };

  function patchAccount(accountHolder, accountType, value, totalReturn, totalReturnPercentage, ytdReturnPercentage, id) {
    let payload = { accountHolder, accountType, value, totalReturn, totalReturnPercentage, ytdReturnPercentage, id };
    async function patchData(endpoint) {
      try{
        let res = await axios.patch(endpoint, payload);
        setSnackbarSuccess(true)
        setAccountsRefresh(!accountsRefresh);
        return;
      } catch (err){
        console.log(err)
        setSnackbarError(true)
      }
    }
    return patchData(endpoint);
  }


  useEffect(() => {
    setAccountHolder(row.holder)
    setAccountType(row.type)
    setValue(row.value)
    setTotalReturn(row.return)
    setTotalReturnPercentage(row.totalReturn)
    setYtdReturnPercentage(row.ytdReturn)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row]);

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
            Edit Account
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
            <Grid item xs={4}>
              <TextField
                id="outlined-basic"
                label="Total Return"
                variant="outlined"
                onChange={handleTotalReturnChange}
                value={totalReturn}
                placeholder="Enter the account's total return dollar value"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="outlined-basic"
                label="Total Return Percentage"
                variant="outlined"
                onChange={handleTotalReturnPercentageChange}
                value={totalReturnPercentage}
                placeholder="Enter the account's total return percentage"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="outlined-basic"
                label="YTD Return"
                variant="outlined"
                onChange={handleYtdReturnPercentageChange}
                value={ytdReturnPercentage}
                placeholder="Enter the account's year-to-date return percentage"
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
