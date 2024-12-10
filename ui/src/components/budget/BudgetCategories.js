import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../AppContext";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import ConfirmDeleteBudgetCategoryDialog from "./ConfirmDeleteBudgetCategoryDialog";
import AddBudgetCategoryModal from "./AddBudgetCategoryModal";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
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
  let { setBudgetRefresh, budgetRefresh } = useContext(AppContext);
  let { currentBudgetCategories } = useContext(AppContext);
  let { setReason } = useContext(AppContext);
  let { setSnackbarSuccess, setSnackbarError } = useContext(AppContext);
  let [openAddCategory, setOpenAddCategory] = useState(false);
  let [currentRow, setCurrentRow] = useState({});
  let [deleteCategory, setDeleteCategory] = useState(false);
  let [budgetRange, setBudgetRange] = useState([]);

  const patchBudgetRange = async () => {
    let payload = {
      budgetRange,
    };
    try {
      let res = await axios.patch(
        "http://localhost:3001/budgetCategories",
        payload
      );
      setSnackbarSuccess(true);
      return res.data;
    } catch (err) {
      setSnackbarError(true);
    }
  };

  async function deleteBudgetCategory() {
    let id = currentRow.budget_categories_id;
    let payload = {
      params: {
        id,
      },
    };
    try {
      let res = await axios.delete(
        `http://localhost:3001/budgetCategories`,
        payload
      );
      setSnackbarSuccess(true);
      return res.data;
    } catch {
      setSnackbarError(true);
    }
  }

  const handleClose = () => setViewCategories(false);

  function handleAdd() {
    setOpenAddCategory(true);
  }

  function handleDelete(row) {
    setCurrentRow(row);
    setDeleteCategory(true);
  }

  function handleDeleteConfirm() {
    deleteBudgetCategory().then(() => {
      setReason("budgetCategory");
      setBudgetRefresh(!budgetRefresh);
    });
  }

  function handleSubmit() {
    patchBudgetRange().then(() => {
      setReason("budgetCategory");
      setBudgetRefresh(!budgetRefresh);
    });
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
