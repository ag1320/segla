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

export default function AddCryptoDialog({
  open,
  handleClose,
  endpoint,
  setCryptoRefresh,
  cryptoRefresh,
}) {
  let [ticker, setTicker] = useState("");
  let [name, setName] = useState("");
  let [url, setUrl] = useState("");
  let [shares, setShares] = useState(0);
  let [totalSpent, setTotalSpent] = useState(0);

  let { setSnackbarSuccess, setSnackbarError } = useContext(AppContext);

  const handleTickerChange = (event) => setTicker(event.target.value);
  const handleNameChange = (event) => setName(event.target.value);
  const handleUrlChange = (event) => setUrl(event.target.value);
  const handleSharesChange = (event) => setShares(event.target.value);
  const handleTotalSpentChange = (event) => setTotalSpent(event.target.value);

  const handleModalClose = (event) => {
    setTicker("");
    setName("");
    setUrl("")
    setShares(0);
    setTotalSpent(0);
    handleClose();
  };

  const handleSubmit = () => {
    postCrypto(ticker, name, url, shares, totalSpent).then(() => {
      handleModalClose();
    });
  };

  function postCrypto(ticker, name, url, shares, totalSpent) {
    let payload = { ticker, name, url, shares, totalSpent };
    async function postData(endpoint) {
      try {
        let res = await axios.post(endpoint, payload);
        setSnackbarSuccess(true);
        setCryptoRefresh(!cryptoRefresh);
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
            Add a New Cryptocurrency
          </Typography>
          <Grid container spacing={2}>
          <Grid item xs={4}>
              <TextField
                id="outlined-basic"
                label="Ticker"
                variant="outlined"
                onChange={handleTickerChange}
                value={ticker}
                placeholder="Enter Ticker Symbol"
                helperText=""
                autoFocus
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="outlined-basic"
                label="Name"
                variant="outlined"
                onChange={handleNameChange}
                value={name}
                placeholder="Enter the cryptocurrency name"
                helperText="Bitcoin, etherieum, etc."
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="outlined-basic"
                label="URL"
                variant="outlined"
                onChange={handleUrlChange}
                value={url}
                placeholder="Enter the cointmarketcap url page for this cryptocurrency"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="outlined-basic"
                label="Shares"
                variant="outlined"
                onChange={handleSharesChange}
                value={shares}
                placeholder="Enter the total shares for this cryptocurrency"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="outlined-basic"
                label="Total Spent"
                variant="outlined"
                onChange={handleTotalSpentChange}
                value={totalSpent}
                placeholder="Enter the total spent for this cryptocurrency"
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
