import { useContext, useRef, useState } from "react";
import { AppContext } from "../../AppContext";
import axios from "axios";
import './AddIncomeModal.css'
import { Modal, Box, Typography, Grid, TextField, Button } from "@mui/material";

export default function AddDistributionModal({ open, setOpen }) {
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    textAlign: "center",
  };

  let { budgetRefresh, setBudgetRefresh } = useContext(AppContext);
  let { date } = useContext(AppContext);
  let { setReason } = useContext(AppContext);
  let { setSnackbarSuccess, setSnackbarError } = useContext(AppContext);
  let [category, setCategory] = useState("");
  let [amount, setAmount] = useState(null);
  const handleCategoryChange = (e) => setCategory(e.target.value);
  const handleAmountChange = (e) => setAmount(e.target.value);
  let inputRef = useRef();

  const postMonthlyIncome = async () => {
    let month = date?.toLocaleString("EN-US", { month: "long" });
    let year = date?.getFullYear();
    let payload = {
      category,
      amount,
      month,
      year,
    };
    try {
      let res = await axios.post(
        "http://localhost:3001/monthlyIncome",
        payload
      );
      setSnackbarSuccess(true);
      return res.data;
    } catch (err) {
      setSnackbarError(true);
    }
  };

  const handleModalClose = () => {
    setCategory("");
    setAmount(null);
    setOpen(false);
  };

  const handleSubmit = () => {
    postMonthlyIncome().then(() => {
      setReason("monthlyIncome");
      setBudgetRefresh(!budgetRefresh);
      handleModalClose();
    });
  };

  const handleAmountKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Box className="monthly-income-text">
            <Typography
              component={"span"}
              id="modal-modal-title"
              variant="h6"
            >
              Submit a New Income Source
            </Typography>
          </Box>
          <Grid container rowSpacing={4} columnSpacing = {2}>
            <Grid item xs={6}>
              <TextField
                label="Catgory"
                variant="outlined"
                onChange={handleCategoryChange}
                value={category}
                inputRef={inputRef}
                placeholder="Enter Source"
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Amount"
                variant="outlined"
                onChange={handleAmountChange}
                onKeyDown={handleAmountKeyDown}
                value={amount}
                placeholder="Enter an Amount"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Grid container justifyContent="end" spacing={2}>
                <Grid item xs={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleModalClose}
                    sx={{ backgroundColor: "#0f4c75" }}
                  >
                    Cancel
                  </Button>
                </Grid>
                <Grid item xs={3}>
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
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </>
  );
}
