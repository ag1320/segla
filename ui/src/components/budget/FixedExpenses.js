import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { formatFixedExpenses } from "./FixedExpensesFuncs";
import { removeFixedExpense } from "../../state/fixedExpensesSlice";
import { setSnackbarSuccess, setSnackbarError } from "../../state/uiSlice";
import { selectBudgetBalance } from "../../utilities/helperFunctions";
import EditFixedExpense from "./EditFixedExpense.js";
import ConfirmDeleteFixedExpenseDialog from "./ConfirmDeleteFixedExpenseDialog.js";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Grid,
  IconButton,
  Box,
  Typography,
} from "@mui/material";

export default function FixedIncome({ setViewExpenses, fixedExpenses }) {
  const dispatch = useDispatch();
  const { totalFixedExpenses } = useSelector(selectBudgetBalance);
  let [editFixedExpense, setEditFixedExpense] = useState(false);
  let [addFixedExpense, setAddFixedExpense] = useState(false);
  let [currentRow, setCurrentRow] = useState({});
  let [deleteFixedExpense, setDeleteFixedExpense] = useState(false);
  let rows = formatFixedExpenses(fixedExpenses);
  let aaronTotal = rows.reduce((prevAmount, currentAaron) => {
    return prevAmount + currentAaron.aaron;
  }, 0);
  let jenTotal = rows.reduce((prevAmount, currentJen) => {
    return prevAmount + currentJen.jen;
  }, 0);

  rows.sort((a, b) => {
    let textA = a.category.toLowerCase();
    let textB = b.category.toLowerCase();
    return textA < textB ? -1 : textA > textB ? 1 : 0;
  });

  rows.push({
    category: "-",
    aaron: aaronTotal,
    jen: jenTotal,
    subtotal: totalFixedExpenses,
  });

  let borders = rows.map((expense, index) => {
    let border = "";
    if (index === rows.length - 2) {
      border = "solid #000 2px";
    } else if (index === rows.length - 1) {
      border = "none";
    } else {
      border = "solid #777 1px";
    }
    return border;
  });

  const handleClose = () => setViewExpenses(false);

  function handleAdd() {
    setAddFixedExpense(true);
  }

  function handleEdit(row) {
    setCurrentRow(row);
    setEditFixedExpense(true);
  }
  function handleDelete(row) {
    setCurrentRow(row);
    setDeleteFixedExpense(true);
  }

  function handleConfirm() {
    let category = currentRow.category;
    dispatch(removeFixedExpense(category))
      .unwrap()
      .then(() => dispatch(setSnackbarSuccess(true)))
      .catch(() => dispatch(setSnackbarError(true)))
      .finally(() => setCurrentRow({}));
  }

  return (
    <>
      <EditFixedExpense
        openEdit={editFixedExpense}
        openAdd={addFixedExpense}
        setOpenEdit={setEditFixedExpense}
        setOpenAdd={setAddFixedExpense}
        currentRow={currentRow}
        setCurrentRow={setCurrentRow}
        expenses={rows}
      />
      <ConfirmDeleteFixedExpenseDialog
        open={deleteFixedExpense}
        setOpen={setDeleteFixedExpense}
        onConfirm={handleConfirm}
        currentRow={currentRow}
      />
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Box style={{ display: "flex", justifyContent: "center" }}>
            <Typography
              component={"span"}
              style={{ color: "#FFF" }}
              textAlign="center"
              variant="h5"
            >
              Master List of Fixed Monthly Expenses
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <TableContainer
            component={Paper}
            sx={{ maxWidth: "600px", margin: "auto", padding: "10px" }}
          >
            <Table aria-label="a dense table" size="small">
              <TableHead>
                <TableRow>
                  <TableCell
                    align="left"
                    width="20%"
                    style={{ borderBottom: "solid #777 1px" }}
                  >
                    <Button onClick={handleAdd} style={{ color: "black" }}>
                      <AddCircleOutline style={{ marginRight: "10px" }} />
                      <Typography component={"span"}>Add Expense</Typography>
                    </Button>
                  </TableCell>
                  <TableCell
                    width="20%"
                    style={{ borderBottom: "solid #777 1px" }}
                  >
                    Category
                  </TableCell>
                  <TableCell
                    align="right"
                    style={{ borderBottom: "solid #777 1px" }}
                  >
                    Aaron
                  </TableCell>
                  <TableCell
                    align="right"
                    style={{ borderBottom: "solid #777 1px" }}
                  >
                    Jen
                  </TableCell>
                  <TableCell
                    align="right"
                    style={{ borderBottom: "solid #777 1px" }}
                  >
                    Subtotal
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow
                    key={row.category}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell
                      align="center"
                      style={{ borderBottom: borders[index] }}
                    >
                      <>
                        {index === rows.length - 1 ? (
                          <Typography component={"span"} variant="h6">
                            Total
                          </Typography>
                        ) : (
                          <>
                            <IconButton onClick={() => handleEdit(row)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => handleDelete(row)}>
                              <DeleteIcon />
                            </IconButton>
                          </>
                        )}
                      </>
                    </TableCell>
                    <TableCell
                      component="th"
                      scope="row"
                      style={{ borderBottom: borders[index] }}
                    >
                      {row.category}
                    </TableCell>
                    <TableCell
                      align="right"
                      style={{ borderBottom: borders[index] }}
                    >{`${
                      row.aaron === 0 ? "-" : `$ ${row.aaron?.toFixed(2)}`
                    }`}</TableCell>
                    <TableCell
                      align="right"
                      style={{ borderBottom: borders[index] }}
                    >{`${
                      row.jen === 0 ? "-" : `$ ${row.jen?.toFixed(2)}`
                    }`}</TableCell>
                    <TableCell
                      align="right"
                      style={{ borderBottom: borders[index] }}
                    >{`${
                      row.subtotal === 0 ? "-" : `$ ${row.subtotal?.toFixed(2)}`
                    }`}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item xs={12}>
          <Box style={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="outlined"
              style={{
                color: "white",
                borderColor: "white",
                maxWidth: "200px",
                marginBottom: "40px",
              }}
              onClick={handleClose}
            >
              Ok
            </Button>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}
