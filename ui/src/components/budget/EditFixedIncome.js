import { useState, useContext, useEffect, forwardRef } from "react";
import { Modal, Box, Typography, TextField, Grid, Button } from "@mui/material";
import { AppContext } from "../../AppContext";
import axios from "axios";
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

  let [source, setSource] = useState(null);
  let [amount, setAmount] = useState(null);
  let { setBudgetRefresh, budgetRefresh } = useContext(AppContext);
  let { error, setError } = useContext(AppContext);
  let { setReason } = useContext(AppContext);
  let { setSnackbarError, setSnackbarSuccess } = useContext(AppContext);
  const handleSourceChange = (e) => setSource(e.target.value);
  const handleAmountChange = (e) => setAmount(e.target.value);

  function editIncome(source, id, amount) {
    let payload = {
      source,
      id,
      amount,
    };
    let url = `http://localhost:3001/fixedIncome`;
    async function patchData(url, payload) {
      try {
        let res = await axios.patch(url, payload);
        setSnackbarSuccess(true);
        return res.data;
      } catch (err) {
        setSnackbarError(true);
      }
    }
    return patchData(url, payload);
  }

  function addIncome(source, amount) {
    let payload = {
      source,
      amount,
    };
    let url = `http://localhost:3001/fixedIncome`;
    async function postData(url, payload) {
      try {
        let res = await axios.post(url, payload);
        setSnackbarSuccess(true);
        return res.data;
      } catch (err) {
        setSnackbarError(true);
      }
    }
    return postData(url, payload);
  }

  const handleModalClose = () => {
    setCurrentRow({});
    setSource(null);
    setAmount(null);
    setOpenEdit(false);
    setOpenAdd(false);
  };

  const handleAddSubmit = () => {
    addIncome(source, amount).then(() => {
      setReason("fixedIncome");
      setBudgetRefresh(!budgetRefresh);
      handleModalClose();
    });
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
    editIncome(newSource, id, amount).then(() => {
      setReason("fixedIncome");
      setBudgetRefresh(!budgetRefresh);
      handleModalClose();
    });
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
  }, [openEdit, openAdd]);

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
