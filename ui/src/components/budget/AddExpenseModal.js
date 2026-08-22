import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import './AddExpenseModal.css'
import { addMonthlyVariedExpense } from "../../state/monthlyExpensesSlice";
import { setSnackbarSuccess, setSnackbarError } from "../../state/uiSlice";
import {
  Modal,
  Box,
  Grid,
  TextField,
  Typography,
  Button,
  Autocomplete,
} from "@mui/material";

export default function AddExpenseModal({ open, setOpen }) {
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

  const formatCategories = (budgetCategories) => {
    let categories = budgetCategories.map((category) => {
      return category.category;
    });

    let categoriesSet = new Set(categories);
    categories = Array.from(categoriesSet);

    let formattedCategories = categories.map((category) => {
      let obj = {};
      return (obj.label = category);
    });
    return formattedCategories;
  };

  const formatSubcategories = (budgetCategories) => {
    let filteredCategories = budgetCategories.filter(
      (category) => category.subcategory
    );
    let categories = filteredCategories.map((category) => {
      return category.subcategory;
    });

    let categoriesSet = new Set(categories);
    categories = Array.from(categoriesSet);

    let formattedCategories = categories.map((category) => {
      let obj = {};
      return (obj.label = category);
    });
    return formattedCategories;
  };

  const dispatch = useDispatch();
  const date = useSelector((state) => state.budget.date);
  const budgetCategories = useSelector((state) => state.budgetCategories.snapshotCategories);
  let [selectedCategory, setSelectedCategory] = useState("");
  let [selectedSubcategory, setSelectedSubcategory] = useState("");
  let [amount, setAmount] = useState(null);
  let formattedCategories = formatCategories(budgetCategories);
  let formattedSubcategories = formatSubcategories(budgetCategories);
  const inputRef = useRef();

  const handleModalClose = () => {
    setAmount(null);
    setSelectedCategory("");
    setSelectedSubcategory("");
    setOpen(false);
  };
  const handleCategoryChange = (e, value) => {
    if (value !== null) {
      setSelectedCategory(value);
    }
  };

  const handleSubcategoryChange = (e, value) => {
    if (value !== null) {
      setSelectedSubcategory(value);
    }
  };

  const handleCategoryKeyDown = (e) => {
    if (e.key === "Tab") {
      handleCategoryChange(e);
    }
  };

  const handleSubcategoryKeyDown = (e) => {
    if (e.key === "Tab") {
      handleCategoryChange(e);
    }
  };

  const handleAmountKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const isOptionEqualToValue = (option, value) => {
    if (value === "" && option === "Eating Out") {
      return true;
    } else if (value === option) {
      return true;
    }
  };

  const handleFocus = (e) => {
    if (selectedCategory === "Utilities" && selectedSubcategory.length === 0) {
      let element = document.querySelector("#subcategory-textfield");
      element.focus();
    }
  };

  const handleAmountChange = (e) => setAmount(e.target.value);
  const handleSubmit = () => {
    let month = date.toLocaleString("EN-US", { month: "long" });
    let year = date.getFullYear();
    dispatch(
      addMonthlyVariedExpense({
        category: selectedCategory,
        subcategory: selectedSubcategory,
        amount,
        month,
        year,
      })
    )
      .unwrap()
      .then(() => {
        dispatch(setSnackbarSuccess(true));
        inputRef.current?.focus();
      })
      .catch(() => dispatch(setSnackbarError(true)));
    setSelectedCategory("");
    setSelectedSubcategory("");
    setAmount(0);
  };

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={handleModalClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Box className="monthly-expense-text">
          <Typography component={"span"} id="modal-modal-title" variant="h6">
            Submit a New Expense
          </Typography>
        </Box>
        <Grid container rowSpacing={4} columnSpacing={2}>
          <Grid item xs={selectedCategory === "Utilities" ? 4 : 6}>
            <Autocomplete
              disablePortal
              id="combo-box-demo"
              options={formattedCategories}
              onChange={handleCategoryChange}
              onKeyPress={handleCategoryKeyDown}
              autoSelect
              isOptionEqualToValue={isOptionEqualToValue}
              autoHighlight
              value={selectedCategory}
              renderInput={(params) => {
                return (
                  <TextField
                    {...params}
                    label="Category"
                    required
                    autoFocus
                    inputRef={inputRef}
                  />
                );
              }}
            />
          </Grid>
          <>
            {selectedCategory === "Utilities" ? (
              <Grid item xs={4}>
                <Autocomplete
                  disablePortals
                  id="subcategory-textfield"
                  options={formattedSubcategories}
                  onChange={handleSubcategoryChange}
                  onKeyPress={handleSubcategoryKeyDown}
                  autoSelect
                  autoHighlight
                  renderInput={(params) => {
                    return (
                      <TextField {...params} label="Subcategory" required />
                    );
                  }}
                />
              </Grid>
            ) : (
              <></>
            )}
          </>
          <Grid item xs={selectedCategory === "Utilities" ? 4 : 6}>
            <TextField
              id="amount-textfield"
              label="Amount"
              variant="outlined"
              onChange={handleAmountChange}
              value={amount}
              onFocus={handleFocus}
              onKeyDown={handleAmountKeyDown}
              placeholder="Enter the Expense Amount"
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
  );
}
