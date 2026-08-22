import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import ConfirmDeleteBudgetCategoryDialog from "./ConfirmDeleteBudgetCategoryDialog";
import AddBudgetCategoryModal from "./AddBudgetCategoryModal";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  updateBudgetCategoriesRange,
  removeBudgetCategory,
} from "../../state/budgetCategoriesSlice";
import { setSnackbarSuccess, setSnackbarError } from "../../state/uiSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Box,
  Typography,
  Slider,
  Grid,
} from "@mui/material";

export default function BudgetCategories({ setViewCategories }) {
  const dispatch = useDispatch();
  const currentBudgetCategories = useSelector((state) => state.budgetCategories.currentCategories);
  let [openAddCategory, setOpenAddCategory] = useState(false);
  let [currentRow, setCurrentRow] = useState({});
  let [deleteCategory, setDeleteCategory] = useState(false);
  let [budgetRange, setBudgetRange] = useState([]);

  const handleClose = () => setViewCategories(false);

  function handleAdd() {
    setOpenAddCategory(true);
  }

  function handleDelete(row) {
    setCurrentRow(row);
    setDeleteCategory(true);
  }

  function handleDeleteConfirm() {
    let id = currentRow.budget_categories_id;
    dispatch(removeBudgetCategory(id))
      .unwrap()
      .then(() => dispatch(setSnackbarSuccess(true)))
      .catch(() => dispatch(setSnackbarError(true)));
  }

  function handleSubmit() {
    dispatch(updateBudgetCategoriesRange(budgetRange))
      .unwrap()
      .then(() => dispatch(setSnackbarSuccess(true)))
      .catch(() => dispatch(setSnackbarError(true)));
  }

  const handleSliderChange = (e, newValue, index) => {
    let newBudgetRange = [...budgetRange];
    newBudgetRange[index].range = newValue;
    setBudgetRange(newBudgetRange);
  };

  const setBudgetRanges = () => {
    let ranges = currentBudgetCategories.filter((value, index, self) => {
      return self.findIndex((v) => v.category === value.category) === index;
    });
    ranges.forEach((budget) => {
      budget.range = [budget.warning, budget.limit];
    });
    setBudgetRange(ranges);
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      setBudgetRanges();
    }
    return () => (mounted = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBudgetCategories]);

  budgetRange.sort((a, b) => {
    let textA = a.category.toLowerCase();
    let textB = b.category.toLowerCase();
    return textA < textB ? -1 : textA > textB ? 1 : 0;
  });

  return (
    <>
      <AddBudgetCategoryModal
        open={openAddCategory}
        setOpen={setOpenAddCategory}
        categories={budgetRange}
      />
      <ConfirmDeleteBudgetCategoryDialog
        open={deleteCategory}
        setOpen={setDeleteCategory}
        onConfirm={handleDeleteConfirm}
        currentRow={currentRow}
      />
      <Grid container spacing={4} style={{ width: "70%" }}>
        <Grid item xs={12}>
          <Box style={{ display: "flex", justifyContent: "center" }}>
            <Typography
              component={"span"}
              style={{ color: "white", textAlign: "center" }}
              variant="h5"
            >
              Budget Categories
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <TableContainer
            component={Paper}
            sx={{ maxWidth: "80%", margin: "auto" }}
          >
            <Table aria-label="a dense table" size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="left" width="10%">
                    <Button onClick={handleAdd} style={{ color: "black" }}>
                      <AddCircleOutline style={{ marginRight: "10px" }} />
                      <Typography component={"span"}>Add Category</Typography>
                    </Button>
                  </TableCell>
                  <TableCell width="20%">Category</TableCell>
                  <TableCell align="left">Warning/Limit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {budgetRange.map((row, index) => (
                  <TableRow
                    key={row.category}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell>
                      <IconButton onClick={() => handleDelete(row)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {row.category}
                    </TableCell>
                    <TableCell align="right">
                      <Slider
                        value={row.range || 0}
                        onChange={(e, value) =>
                          handleSliderChange(e, value, index)
                        }
                        valueLabelDisplay="auto"
                        min={0}
                        max={1000}
                        step={10}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item xs={12}>
          <Box
            style={{
              display: "flex",
              justifyContent: "center",
              maxWidth: "80%",
              margin: "auto",
            }}
          >
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={"auto"}>
                <Button
                  variant="outlined"
                  style={{
                    color: "white",
                    borderColor: "white",
                    maxWidth: "200px",
                  }}
                  onClick={handleClose}
                >
                  Back
                </Button>
              </Grid>
              <Grid item xs={"auto"}>
                <Button
                  variant="outlined"
                  style={{
                    color: "white",
                    borderColor: "white",
                    maxWidth: "200px",
                    marginBottom: '40px'
                  }}
                  onClick={handleSubmit}
                >
                  Submit
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}
