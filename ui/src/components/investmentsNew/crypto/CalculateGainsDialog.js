import { useState, useRef } from "react";
import CryptoGainsSummaryDialog from "./CryptoGainsSummaryDialog.js";
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
  width: 500,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  textAlign: "center",
};

export default function CalculateGainsDialog({ open, handleClose, rows }) {
  let [ticker, setTicker] = useState("");
  let [amountInvested, setAmountInvested] = useState(0);
  let [openSummary, setOpenSummary] = useState(false);

  let tickers = rows.map((item) => item.ticker);

  const handleTickerChange = (e, value) => {
    if (value !== null) {
      setTicker(value);
    }
  };
  const handleAmountInvestedChange = (event) =>
    setAmountInvested(event.target.value);

  const handleModalClose = (event) => {
    setTicker("");
    setAmountInvested(0);
    handleClose();
  };

  const handleSubmit = () => {
    setOpenSummary(true);
  };

  const handleTickerKeyDown = (e) => {
    if (e.key === "Tab") {
      handleTickerChange(e);
    }
  };

  const isOptionEqualToValue = (option, value) => {
    if (value === option) {
      return true;
    }
  };

  return (
    <>
      <CryptoGainsSummaryDialog
        rows={rows}
        setOpenSummary={setOpenSummary}
        openSummary = {openSummary}
        ticker={ticker}
        amountInvested={amountInvested}
        setTicker = {setTicker}
        setAmountInvested = {setAmountInvested}
      />
      <Modal
        open={open}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography component={"span"} id="modal-modal-title" variant="h6">
            Enter the Information to Calculate Gains/Losses and Cost Basis
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} />
            <Grid item xs={6}>
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={tickers}
                autoSelect
                autoHighlight
                isOptionEqualToValue={isOptionEqualToValue}
                onChange={handleTickerChange}
                onKeyPress={handleTickerKeyDown}
                onSelect={handleTickerChange}
                renderInput={(params) => (
                  <TextField {...params} label="Tickers" autoFocus />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="outlined-basic"
                label="Amount Invested"
                variant="outlined"
                onChange={handleAmountInvestedChange}
                value={amountInvested}
                placeholder="Enter the amount invested in this cryptocurrency"
                helperText=""
                fullWidth
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
