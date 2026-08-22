import { useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import './AddIncomeModal.css'
import { addMonthlyIncome } from "../../state/monthlyIncomeSlice";
import { setSnackbarSuccess, setSnackbarError } from "../../state/uiSlice";
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

  const dispatch = useDispatch();
  const date = useSelector((state) => state.budget.date);
  let [category, setCategory] = useState("");
  let [amount, setAmount] = useState(null);
  const handleCategoryChange = (e) => setCategory(e.target.value);
  const handleAmountChange = (e) => setAmount(e.target.value);
  let inputRef = useRef();

  const handleModalClose = () => {
    setCategory("");
    setAmount(null);
    setOpen(false);
  };

  const handleSubmit = () => {
    let month = date?.toLocaleString("EN-US", { month: "long" });
    let year = date?.getFullYear();
    dispatch(addMonthlyIncome({ category, amount, month, year }))
      .unwrap()
      .then(() => dispatch(setSnackbarSuccess(true)))
      .catch(() => dispatch(setSnackbarError(true)));
    handleModalClose();
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
