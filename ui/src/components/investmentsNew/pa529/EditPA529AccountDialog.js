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

export default function EditPA529AccountDialog({
  open,
  handleClose,
  endpoint,
  setAccountsRefresh,
  accountsRefresh,
  row
}) {

  
  let [beneficiary, setBeneficiary] = useState("");
  let [value, setValue] = useState(0);
  let [totalReturn, setTotalReturn] = useState(0);
  let [year, setYear] = useState("");

  let { setSnackbarSuccess, setSnackbarError } = useContext(AppContext);

  const handleBeneficiaryChange = (event) =>
    setBeneficiary(event.target.value);
  const handleValueChange = (event) => setValue(event.target.value);
  const handleTotalReturnChange = (event) => setTotalReturn(event.target.value);
  const handleYearChange = (event) => setYear(event.target.value);


  const handleModalClose = (event) => {
    handleClose();
  };

  const handleSubmit = () => {
    patchAccount(beneficiary, value, totalReturn, year, row.id).then(() => {
      handleModalClose();
    });
  };

  function patchAccount(beneficiary, value, totalReturn, year, id) {
    let payload = { beneficiary, value, totalReturn, year, id };
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
    setBeneficiary(row.beneficiary)
    setValue(row.value)
    setTotalReturn(row.return)
    setYear(row.year)
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
