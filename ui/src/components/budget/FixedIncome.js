import { useState, useContext, useRef } from "react";
import { AppContext } from "../../AppContext";
import EditFixedIncome from "./EditFixedIncome";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmDeleteFixedIncomeDialog from "./ConfirmDeleteFixedIncomeDialog";
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

export default function FixedIncome({ setViewIncome, fixedIncome }) {
  let { setBudgetRefresh, budgetRefresh } = useContext(AppContext);
  let { totalFixedIncome } = useContext(AppContext);
  let { setReason } = useContext(AppContext);
  let { setSnackbarError, setSnackbarSuccess } = useContext(AppContext);
  let [editIncome, setEditIncome] = useState(false);
  let [deleteIncome, setDeleteIncome] = useState(false);
  let [addIncome, setAddIncome] = useState(false);
  let [currentRow, setCurrentRow] = useState({});
  const sourceRef = useRef();
  let rows = [];
  function createData(source, amount, id) {
    return { source, amount, id };
  }

  for (let income of fixedIncome) {
    let row = createData(income.name, income.amount, income.income_id);
    rows.push(row);
  }

  rows.sort((a, b) => {
    let textA = a.source.toLowerCase();
    let textB = b.source.toLowerCase();
    return textA < textB ? -1 : textA > textB ? 1 : 0;
  });

  rows.push({
    source: "Total",
    amount: totalFixedIncome,
  });

  let borders = rows.map((income, index) => {
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

  function deleteIncomeSource(source) {
    let payload = {
      params: {
        source,
      },
    };
    let url = `http://localhost:3001/fixedIncome`;
    async function deleteData(url, payload) {
      try {
        let res = await axios.delete(url, payload);
        setSnackbarSuccess(true);
        return res.data;
      } catch (err) {
        setSnackbarError(true);
      }
    }
    return deleteData(url, payload);
  }

  const handleClose = () => setViewIncome(false);
  const handleAdd = () => {
    setAddIncome(true);
  };
  const handleEdit = (row) => {
    setCurrentRow(row);
    setEditIncome(true);
  };
  const handleDelete = (row) => {
    setCurrentRow(row);
    setDeleteIncome(true);
  };

  const handleConfirm = () => {
    let source = currentRow.source;
    deleteIncomeSource(source).then(() => {
      setReason("fixedIncome");
      setBudgetRefresh(!budgetRefresh);
      setCurrentRow({});
    });
  };

  return (
    <>
      <EditFixedIncome
        openAdd={addIncome}
        openEdit={editIncome}
        setOpenAdd={setAddIncome}
        setOpenEdit={setEditIncome}
        currentRow={currentRow}
        setCurrentRow={setCurrentRow}
        ref={sourceRef}
      />
      <ConfirmDeleteFixedIncomeDialog
        open={deleteIncome}
        setOpen={setDeleteIncome}
        currentRow={currentRow}
        onConfirm={handleConfirm}
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
              Master List of Monthly Income
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <TableContainer
            component={Paper}
            sx={{ maxWidth: "500px", margin: "auto", padding: "10px" }}
          >
            <Table aria-label="a dense table" size="small">
              <TableHead>
                <TableRow>
                  <TableCell style={{ borderBottom: "solid #777 1px" }}>
                    <Button onClick={handleAdd} style={{ color: "black" }}>
                      <AddCircleOutline style={{ marginRight: "10px" }} />
                      <Typography component={"span"}>Add Income</Typography>
                    </Button>
                  </TableCell>
                  <TableCell style={{ borderBottom: "solid #777 1px" }}>
                    Source
                  </TableCell>
                  <TableCell
                    align="right"
                    style={{ borderBottom: "solid #777 1px" }}
                  >
                    Amount
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, id) => (
                  <TableRow
                    key={id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell
                      align="left"
                      style={{ borderBottom: borders[id] }}
                    >
                      {id === rows.length - 1 ? (
                        <Typography variant="h6" component={"span"}>
                          {row.source}
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
                    </TableCell>
                    <TableCell
                      component="th"
                      scope="row"
                      style={{ borderBottom: borders[id] }}
                    >
                      {id === rows.length - 1 ? (
                        <Typography component={"span"}>-</Typography>
                      ) : (
                        <Typography component={"span"}>{row.source}</Typography>
                      )}
                    </TableCell>
                    <TableCell
                      align="right"
                      style={{ borderBottom: borders[id] }}
                    >{`$ ${row.amount.toFixed(2)}`}</TableCell>
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
