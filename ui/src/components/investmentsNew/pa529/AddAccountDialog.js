import { useState, useContext } from "react";
import { AppContext } from "../../../AppContext";
import axios from "axios";
import { Modal, Typography, Box, Grid, TextField, Button } from "@mui/material";

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
  let [beneficiary, setBeneficiary] = useState("");
  let [value, setValue] = useState(0);
  let [totalReturn, setTotalReturn] = useState(0);
  let [year, setYear] = useState("");
  let { setSnackbarSuccess, setSnackbarError } = useContext(AppContext);

  const handleBeneficiaryChange = (event) => setBeneficiary(event.target.value);
  const handleValueChange = (event) => setValue(event.target.value);
  const handleTotalReturnChange = (event) => setTotalReturn(event.target.value);
  const handleYearChange = (event) => setYear(event.target.value);

  const handleModalClose = (event) => {
    setBeneficiary("");
    setValue(0);
    setTotalReturn(0);
    setYear("");
    handleClose();
  };

  const handleSubmit = () => {
    postAccount(beneficiary, value, totalReturn, year).then(() => {
      handleModalClose();
    });
  };

  function postAccount(beneficiary, value, totalReturn, year) {
    let payload = { beneficiary, value, totalReturn, year };
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
            Add a new Account
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <TextField
                id="outlined-basic"
                label="Beneficiary"
                variant="outlined"
                onChange={handleBeneficiaryChange}
                value={beneficiary}
                placeholder="Enter a Beneficiary"
                helperText="This person recieves the benefits of this account"
                autoFocus
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                id="outlined-basic"
                label="Value"
                variant="outlined"
                onChange={handleValueChange}
                value={value}
                placeholder="Enter the account's current value"
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                id="outlined-basic"
                label="Total Return"
                variant="outlined"
                onChange={handleTotalReturnChange}
                value={totalReturn}
                placeholder="Enter the account's total return dollar value"
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                id="outlined-basic"
                label="Projected Year for Attending College"
                variant="outlined"
                onChange={handleYearChange}
                value={year}
                placeholder="Enter the Projected Year for Attending College"
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
