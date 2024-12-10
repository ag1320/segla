import { useState, useContext, useEffect, useRef } from "react";
import { AppContext } from "../../AppContext";
import axios from "axios";
import {
  Modal,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Autocomplete,
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
  let [url, setUrl] = useState("");
  let [holder, setHolder] = useState("");
  let [interestRate, setInterestRate] = useState(0);
  let [payoffDate, setPayoffDate] = useState("");
  let [monthlyPayment, setMonthlyPayment] = useState(0);
  let [remainingBalance, setRemainingBalance] = useState(0);
  let [type, setType] = useState("");
  let [error, setError] = useState(false);

  let { setSnackbarSuccess, setSnackbarError } = useContext(AppContext);

  const handleUrlChange = (event) => setUrl(event.target.value);
  const handleHolderChange = (event) => setHolder(event.target.value);
  const handleInterestRateChange = (event) =>
    setInterestRate(event.target.value);
  const handlePayoffDateChange = (event) => setPayoffDate(event.target.value);
  const handleMonthlyPaymentChange = (event) =>
    setMonthlyPayment(event.target.value);
  const handleRemainingBalanceChange = (event) =>
    setRemainingBalance(event.target.value);

  const handleModalClose = (event) => {
    setUrl("");
    setHolder("");
    setInterestRate(0);
    setPayoffDate("");
    setMonthlyPayment(0);
    setRemainingBalance(0);
    setError(false);
    handleClose();
  };

  const handleSubmit = () => {
    if (!error) {
      postAccount(
        url,
        holder,
        interestRate,
        payoffDate,
        monthlyPayment,
        remainingBalance,
        type
      ).then(() => {
        handleModalClose();
      });
    }
  };

  function postAccount(
    url,
    holder,
    interestRate,
    payoffDate,
    monthlyPayment,
    remainingBalance,
    type
  ) {
    let payload = {
      url,
      holder,
      interestRate,
      payoffDate,
      monthlyPayment,
      remainingBalance,
      type,
    };
    async function postData(endpoint) {
      try {
        let res = await axios.post(endpoint, payload);
        setSnackbarSuccess(true);
        setAccountsRefresh(!accountsRefresh);
        return res.data;
      } catch (err) {
        setSnackbarError(true);
      }
    }
    return postData(endpoint);
  }

  //autocomplete stuff
  const [isError, setIsError] = useState(false);

  const handleInputChange = (_, newValue) => {
    if (!newValue) {
      setIsError(true);
    } else {
      setIsError(false);
    }
  };

  const handleBlur = () => {
    if (!type) {
      setIsError(true);
    }
  };

  const types = ["Auto Loan", "Mortgage", "Student Loan"]; // Define your options

  const handleKeyDown = (event, value) => {
    if (event.key === "Tab") {
      setType(value);
    }
  };

  const isOptionEqualToValue = (option, value) => {
    if (value === option) {
      return true;
    }
  };
  //end autocomplete stuff

  return (
    <>
      <Modal
        open={open}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography component={"span"} id="modal-modal-title" variant="h6">
            Add a New Account
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} />
            <Grid item xs={3}>
              <Autocomplete
                options={types}
                disablePortal
                value={type}
                onChange={(_, newValue) => setType(newValue)}
                onInputChange={handleInputChange}
                isOptionEqualToValue={isOptionEqualToValue}
                autoHighlight
                autoSelect
                onKeyPress={handleKeyDown}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Type"
                    variant="outlined"
                    required
                    error={isError}
                    onBlur={handleBlur}
                    autoFocus
                  />
                )}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                id="outlined-basic"
                label="Account Holder"
                variant="outlined"
                onChange={handleHolderChange}
                value={holder}
                placeholder="Enter an Account Holder"
                helperText="This person owns the account"
                fullWidth
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                id="outlined-basic"
                label="Interest Rate"
                variant="outlined"
                onChange={handleInterestRateChange}
                value={interestRate}
                placeholder="Enter the account's interest rate"
                helperText=""
                fullWidth
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                id="outlined-basic"
                label="Payoff Date"
                variant="outlined"
                onChange={handlePayoffDateChange}
                value={payoffDate}
                placeholder="Enter the expected payoff year"
                helperText=""
                fullWidth
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                id="outlined-basic"
                label="Monthly Payment"
                variant="outlined"
                onChange={handleMonthlyPaymentChange}
                value={monthlyPayment}
                placeholder="Enter the Monthly Payment"
                helperText=""
                fullWidth
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                id="outlined-basic"
                label="Remaining Balance"
                variant="outlined"
                onChange={handleRemainingBalanceChange}
                value={remainingBalance}
                placeholder="Enter the Remaining Balance"
                helperText=""
                fullWidth
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                id="outlined-basic"
                label="URL"
                variant="outlined"
                onChange={handleUrlChange}
                value={url}
                placeholder="Enter the loan servicer's website"
                helperText=""
                fullWidth
              />
            </Grid>
            <Grid item xs={3} />

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
