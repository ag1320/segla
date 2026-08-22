import { useState, useEffect } from "react";
import { Modal, Box, Typography, TextField, Grid, Button } from "@mui/material";
import { useDispatch } from "react-redux";
import { addFixedExpense, updateFixedExpense } from "../../state/fixedExpensesSlice";
import { setSnackbarSuccess, setSnackbarError } from "../../state/uiSlice";
import "./EditFixedExpense.css";
export default function EditFixedExpense({
  openEdit,
  openAdd,
  setOpenEdit,
  setOpenAdd,
  currentRow,
  setCurrentRow,
  expenses,
}) {
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 900,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    textAlign: "center",
  };

  const dispatch = useDispatch();
  let [category, setCategory] = useState(null);
  let [aaron, setAaron] = useState(null);
  let [jen, setJen] = useState(null);
  let [error, setError] = useState(false);
  const handleCategoryChange = (e) => setCategory(e.target.value);
  const handleAaronChange = (e) => setAaron(e.target.value);
  const handleJenChange = (e) => setJen(e.target.value);

  const handleModalClose = () => {
    setCurrentRow({});
    setError(false);
    setCategory(null);
    setAaron(null);
    setJen(null);
    setOpenEdit(false);
    setOpenAdd(false);
  };
  const handleAddSubmit = () => {
    if (error) {
      alert(
        "Category Already Exists - Submit a New Category, or Edit the Existing Category."
      );
      return;
    }
    dispatch(addFixedExpense({ category, aaron, jen }))
      .unwrap()
      .then(() => dispatch(setSnackbarSuccess(true)))
      .catch(() => dispatch(setSnackbarError(true)));
    handleModalClose();
  };
  const handleEditSubmit = () => {
    let oldCategory = currentRow.category;
    let newCategory = "";
    if (!category) {
      newCategory = oldCategory;
    } else {
      newCategory = category;
    }
    if (!aaron) {
      aaron = currentRow.aaron;
    }
    if (!jen) {
      jen = currentRow.jen;
    }
    dispatch(updateFixedExpense({ category: newCategory, oldCategory, aaron, jen }))
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

  const handleCategoryBlur = () => {
    let doesIncludeCategory =
      expenses.filter(
        (e) => e.category?.toLowerCase() === category?.toLowerCase()
      ).length > 0;
    if (openAdd && doesIncludeCategory) {
      setError(true);
    } else {
      setError(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      setCategory(currentRow.category);
      setAaron(currentRow.aaron);
      setJen(currentRow.jen);
    }
    return () => (mounted = false);
  }, [currentRow]);

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
            <Box className="expense-text">
              <Typography
                component={"span"}
                id="modal-modal-title"
                variant="h6"
              >
                Add Expense
              </Typography>
            </Box>
          ) : (
            <Box className="expense-text">
              <Typography
                component={"span"}
                id="modal-modal-title"
                variant="h6"
              >
                Edit Expenses
              </Typography>
            </Box>
          )}
          <Grid container rowSpacing={4} columnSpacing={2}>
            <Grid item xs={4}>
              <TextField
                id="outlined-basic"
                label="Category"
                variant="outlined"
                onChange={handleCategoryChange}
                value={category}
                error={error}
                helperText={error? 'Category Already Exists': ''}
                onBlur={handleCategoryBlur}
                placeholder="Enter a Category"
                required
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="outlined-basic"
                label="Aaron"
                variant="outlined"
                onChange={handleAaronChange}
                onKeyDown={handleAmountKeyDown}
                value={aaron}
                placeholder="Enter an amount for Aaron"
                required
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="outlined-basic"
                label="Jen"
                variant="outlined"
                onChange={handleJenChange}
                onKeyDown={handleAmountKeyDown}
                value={jen}
                placeholder="Enter an amount for Jen"
                required
              />
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
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
