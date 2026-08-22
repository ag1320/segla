import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./AddDistributionModal.css";
import { addMonthEndDistribution } from "../../state/monthEndDistributionsSlice";
import { setSnackbarSuccess, setSnackbarError } from "../../state/uiSlice";
import { selectBudgetBalance } from "../../utilities/helperFunctions";
import {
  Modal,
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Autocomplete,
} from "@mui/material";

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
  const { remainingBalance } = useSelector(selectBudgetBalance);
  let [category, setCategory] = useState("");
  let [amount, setAmount] = useState(null);
  const handleCategoryChange = (e, value) =>
    setCategory(value?.label || e.target.value);
  const handleAmountChange = (e) => setAmount(e.target.value);
  const inputRef = useRef();
  const categories = [
    { label: "Retirement" },
    { label: "Investment" },
    { label: "Emergency Fund" },
    { label: "College Fund" },
    { label: "Checking Account" },
    { label: "Savings account" },
    { label: "Crypto" },
  ];

  const handleModalClose = () => {
    setCategory("");
    setAmount(null);
    setOpen(false);
  };

  const handleSubmit = () => {
    let month = date?.toLocaleString("EN-US", { month: "long" });
    let year = date?.getFullYear();
    dispatch(addMonthEndDistribution({ category, amount, month, year }))
      .unwrap()
      .then(() => dispatch(setSnackbarSuccess(true)))
      .catch(() => dispatch(setSnackbarError(true)));
    setCategory("");
    setAmount("");
  };

  const handleCategoryKeyDown = (e) => {
    if (e.key === "Tab") {
      handleCategoryChange(e);
    }
  };

  const handleAmountKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  return (
    <>
      <Modal
        open={open}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Box className="monthly-distribution-text">
            <Typography component={"span"} id="modal-modal-title" variant="h6">
              Submit a New Month End Distribution
            </Typography>
          </Box>
          <Grid container style = {{marginBottom: "10px"}}>
            <Grid item xs="auto">
              <Typography
                component={"span"}
                id="modal-remaining-balance"
                variant="body1"
              >
                Remaining Balance:
              </Typography>
            </Grid>
            <Grid item xs="auto">
              <Typography
                component={"span"}
                id="modal-remaining-balance"
                variant = "body1"
                style = {{marginLeft: "10px"}}
              >
                $ {remainingBalance}
              </Typography>
            </Grid>
          </Grid>
          <Grid container rowSpacing={4} columnSpacing={2}>
            <Grid item xs={6}>
              <Autocomplete
                disablePortal
                options={categories}
                onChange={handleCategoryChange}
                onKeyPress={handleCategoryKeyDown}
                autoSelect
                autoHighlight
                freeSolo
                value={category}
                renderInput={(params) => {
                  return (
                    <TextField
                      {...params}
                      label="Category"
                      required
                      inputRef={inputRef}
                      autoFocus
                    />
                  );
                }}
              />
            </Grid>
            <>
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
            </>
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
