import { useState, useEffect, forwardRef } from "react";
import { Modal, Box, Typography, TextField, Grid, Button } from "@mui/material";
import { useDispatch } from "react-redux";
import { addFixedIncome, updateFixedIncome } from "../../state/fixedIncomeSlice";
import { setSnackbarSuccess, setSnackbarError } from "../../state/uiSlice";
import "./EditFixedIncome.css";

function EditFixedIncomeComponent(
  { openEdit, openAdd, setOpenEdit, setOpenAdd, currentRow, setCurrentRow },
  ref
) {
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
  let [source, setSource] = useState(null);
  let [amount, setAmount] = useState(null);
  let [error] = useState(false);
  const handleSourceChange = (e) => setSource(e.target.value);
  const handleAmountChange = (e) => setAmount(e.target.value);

  const handleModalClose = () => {
    setCurrentRow({});
    setSource(null);
    setAmount(null);
    setOpenEdit(false);
    setOpenAdd(false);
  };

  const handleAddSubmit = () => {
    dispatch(addFixedIncome({ source, amount }))
      .unwrap()
      .then(() => dispatch(setSnackbarSuccess(true)))
      .catch(() => dispatch(setSnackbarError(true)));
    handleModalClose();
  };

  const handleEditSubmit = () => {
    let oldSource = currentRow.source;
    let id = currentRow.id;
    let newSource = "";
    if (!source) {
      newSource = oldSource;
    } else {
      newSource = source;
    }
    if (!amount) {
      amount = currentRow.amount;
    }
    dispatch(updateFixedIncome({ source: newSource, id, amount }))
      .unwrap()
      .then(() => dispatch(setSnackbarSuccess(true)))
      .catch(() => dispatch(setSnackbarError(true)));
    handleModalClose();
  };

  const handleAmountKeyDown = (e) => {
    if (e.key === "Enter") {
      if (openAdd) {
        handleAddSubmit();
      } else {
        handleEditSubmit();
      }
    }
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      setAmount(currentRow.amount);
      setSource(currentRow.source);
    }
    return () => (mounted = false);
  }, [currentRow]);

  useEffect(() => {
    ref?.current?.focus();
  }, [openEdit, openAdd, ref]);

  return (
    <>
      <Modal
        open={openAdd || openEdit}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {openAdd ? (
            <Box className="income-text">
              <Typography
                component={"span"}
                id="modal-modal-title"
                variant="h6"
              >
                Add Income
              </Typography>
            </Box>
          ) : (
            <Box className="income-text">
              <Typography
                component={"span"}
                id="modal-modal-title"
                variant="h6"
                style={{ marginBottom: 20 }}
              >
                Edit Income
              </Typography>
            </Box>
          )}
          <Grid container rowSpacing={4} columnSpacing={2}>
            <Grid item xs={6}>
              <TextField
                id="outlined-basic"
                label="Source"
                variant="outlined"
                onChange={handleSourceChange}
                inputRef={ref}
                // inputProps={{ ref: sourceRef }}
                value={source}
                placeholder="Enter an Income Source"
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="outlined-basic"
                label="Amount"
                variant="outlined"
                onChange={handleAmountChange}
                onKeyDown={handleAmountKeyDown}
                value={amount}
                placeholder="Enter an income amount"
                required
                error={error}
              />
            </Grid>
            <Grid item xs={6}>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing = {2}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleModalClose}
                    sx={{ backgroundColor: "#0f4c75" }}
                  >
                    Cancel
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  {openAdd ? (
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleAddSubmit}
                      sx={{ backgroundColor: "#0f4c75" }}
                    >
                      Submit
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleEditSubmit}
                      sx={{ backgroundColor: "#0f4c75" }}
                    >
                      Submit
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </>
  );
}

const EditFixedIncome = forwardRef(EditFixedIncomeComponent);
export default EditFixedIncome;
