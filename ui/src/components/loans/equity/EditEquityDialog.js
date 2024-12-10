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

export default function EditEquityDialog({
  open,
  handleClose,
  endpoint,
  setEquityRefresh,
  equityRefresh,
  row
}) {

  let [address, setAddress] = useState("");
  let [valuation, setValuation] = useState(0);
  let [remainingBalance, setRemainingBalance] = useState(0);

  let { setSnackbarSuccess, setSnackbarError } = useContext(AppContext);

  const handleAddressChange = (event) => setAddress(event.target.value);
  const handleValuationChange = (event) => setValuation(event.target.value);
  const handleRemainingBalanceChange = (event) => setRemainingBalance(event.target.value);

  const handleModalClose = (event) => {
    handleClose();
  };

  const handleSubmit = () => {
    patchAccount(address, valuation, remainingBalance, row.id).then(() => {
      handleModalClose();
    });
  };

  function patchAccount(address, valuation, remainingBalance, id) {
    let payload = { address, valuation, remainingBalance, id };
    async function patchData(endpoint) {
      try{
        let res = await axios.patch(endpoint, payload);
        setSnackbarSuccess(true)
        setEquityRefresh(!equityRefresh);
        return;
      } catch (err){
        console.log(err)
        setSnackbarError(true)
      }
    }
    return patchData(endpoint);
  }


  useEffect(() => {
    setAddress(row.address)
    setValuation(row.valuation)
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
            Edit Equity Entry
          </Typography>
          <Grid container spacing={2}>
          <Grid item xs={6}>
              <TextField
                id="outlined-basic"
                label="Address"
                variant="outlined"
                onChange={handleAddressChange}
                value={address}
                placeholder="Enter the address of the property"
                helperText=""
                autoFocus
                fullWidth
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                id="outlined-basic"
                label="Valuation"
                variant="outlined"
                onChange={handleValuationChange}
                value={valuation}
                placeholder="Enter the current valuation of the property"
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
                placeholder="Enter the remaining balance on the mortgage"
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
