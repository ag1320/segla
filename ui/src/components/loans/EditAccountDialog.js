import { useState, useContext, useEffect} from "react";
import { AppContext } from "../../AppContext";
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

export default function EditAccountDialog({
  open,
  handleClose,
  endpoint,
  setAccountsRefresh,
  accountsRefresh,
  row
}) {

  let [url, setUrl] = useState("");
  let [holder, setHolder] = useState("");
  let [interestRate, setInterestRate] = useState(0);
  let [payoffDate, setPayoffDate] = useState("");
  let [monthlyPayment, setMonthlyPayment] = useState(0);
  let [remainingBalance, setRemainingBalance] = useState(0);

  let { setSnackbarSuccess, setSnackbarError } = useContext(AppContext);

  const handleUrlChange = (event) => setUrl(event.target.value);
  const handleHolderChange = (event) => setHolder(event.target.value);
  const handleInterestRateChange = (event) => setInterestRate(event.target.value);
  const handlePayoffDateChange = (event) => setPayoffDate(event.target.value);
  const handleMonthlyPaymentChange = (event) => setMonthlyPayment(event.target.value);
  const handleRemainingBalanceChange = (event) => setRemainingBalance(event.target.value);

  const handleModalClose = (event) => {
    handleClose();
  };

  const handleSubmit = () => {
    patchAccount(url, holder, interestRate, payoffDate, monthlyPayment, remainingBalance, row.id).then(() => {
      handleModalClose();
    });
  };

  function patchAccount(url, holder, interestRate, payoffDate, monthlyPayment, remainingBalance, id) {
    let payload = { url, holder, interestRate, payoffDate, monthlyPayment, remainingBalance, id };
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
    setHolder(row.holder)
    setUrl(row.url)
    setInterestRate(row.interestRate)
    setPayoffDate(row.payoffDate)
    setMonthlyPayment(row.monthlyPayment)
    setRemainingBalance(row.remainingBalance)
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
                onChange={handleHolderChange}
                value={holder}
                placeholder="Enter an Account Holder"
                helperText="This person owns the account"
                autoFocus
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="outlined-basic"
                label="Interest Rate"
                variant="outlined"
                onChange={handleInterestRateChange}
                value={interestRate}
                placeholder="Enter the account's interest rate"
                helperText=""
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="outlined-basic"
                label="Payoff Date"
                variant="outlined"
                onChange={handlePayoffDateChange}
                value={payoffDate}
                placeholder="Enter the expected payoff year"
                helperText=""
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="outlined-basic"
                label="Monthly Payment"
                variant="outlined"
                onChange={handleMonthlyPaymentChange}
                value={monthlyPayment}
                placeholder="Enter the Monthly Payment"
                helperText=""
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="outlined-basic"
                label="Remaining Balance"
                variant="outlined"
                onChange={handleRemainingBalanceChange}
                value={remainingBalance}
                placeholder="Enter the Remaining Balance"
                helperText=""
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="outlined-basic"
                label="URL"
                variant="outlined"
                onChange={handleUrlChange}
                value={url}
                placeholder="Enter the loan servicer's website"
                helperText=""
              />
            </Grid>
            <Grid item xs={4}/>

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
