import { useState } from "react";
import { useDispatch } from "react-redux";
import { addBask } from "../../../state/baskSlice";
import { setSnackbarSuccess, setSnackbarError } from "../../../state/uiSlice";
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

export default function AddAccountDialog({ open, handleClose }) {
  const dispatch = useDispatch();
  let [interestRate, setInterestRate] = useState(0);
  let [value, setValue] = useState(0);
  let [totalReturn, setTotalReturn] = useState(0);
  let [ytdReturn, setYtdReturn] = useState(0);

  const handleInterestRateChange = (event) =>
    setInterestRate(event.target.value);
  const handleValueChange = (event) => setValue(event.target.value);
  const handleTotalReturnChange = (event) => setTotalReturn(event.target.value);
  const handleYtdReturnChange = (event) => setYtdReturn(event.target.value);

  const handleModalClose = (event) => {
    setInterestRate(0);
    setTotalReturn(0);
    setYtdReturn(0);
    setValue(0);
    handleClose();
  };

  const handleSubmit = () => {
    dispatch(addBask({ interestRate, value, totalReturn, ytdReturn }))
      .unwrap()
      .then(() => dispatch(setSnackbarSuccess(true)))
      .catch(() => dispatch(setSnackbarError(true)));
    handleModalClose();
  };

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
                label="Interest Rate"
                variant="outlined"
                onChange={handleInterestRateChange}
                value={interestRate}
                placeholder="Enter the current interest rate"
                helperText=""
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
                label="YTD Return"
                variant="outlined"
                onChange={handleYtdReturnChange}
                value={ytdReturn}
                placeholder="Enter the account's year-to-date return dollar value"
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
