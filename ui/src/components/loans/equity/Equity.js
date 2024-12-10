import AddEquityButton from "./AddEquityButton";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { withStyles } from "@mui/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfrirmDeleteEquityDialog from "./ConfirmDeleteEquityDialog.js";
import EditIcon from "@mui/icons-material/Edit";
import EditEquityDialog from "./EditEquityDialog";
import { getColumns } from "./EquityTableData";
import { AppContext } from "../../../AppContext";
import {
  Grid,
  TableCell,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  IconButton,
} from "@mui/material";

const StyledTableCell = withStyles({
  root: {
    color: "white",
  },
})(TableCell);

const columns = getColumns();

export default function Equity() {
  //initialize vars
  let [openConfirmDeleteEquity, setOpenConfirmDeleteEquity] = useState(false);
  let [openEditEquityDialog, setOpenEditEquityDialog] = useState(false);
  let [equityRefresh, setEquityRefresh] = useState({});
  let [currentRow, setCurrentRow] = useState({});
  let [rows, setRows] = useState([]);
  let height = window.innerHeight * 0.89;
  let endpoint = `http://localhost:3001/equity`;
  let { setEquityTotal } = useContext(AppContext);

  // Calculate total value and total return
  const totalEquity = rows.reduce((total, row) => total + row.equity, 0);
  // Format totalValue and totalReturn as currency (US format)
  const formattedTotalEquity = totalEquity.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });


  const handleEdit = (row) => {
    setCurrentRow(row);
    setOpenEditEquityDialog(true);
  };

  const handleEditClose = () => {
    setCurrentRow({});
    setOpenEditEquityDialog(false);
  };
  const handleDelete = (row) => {
    setCurrentRow(row);
    setOpenConfirmDeleteEquity(true);
  };

  //async call to backend
  async function getData(endpoint) {
    try {
      let res = await axios.get(endpoint);
      return res.data;
    } catch (err) {
      console.log(err);
      return;
    }
  }

  //on page load, get data
  useEffect(() => {
    getData(endpoint).then((items) => {
      if (items) {
        const transformedData = items.map((item) => ({
          id: item.equity_id,
          address: item.address,
          valuation: item.valuation,
          remainingBalance: item.remaining_balance,
          equity: item.valuation - item.remaining_balance
        }));
        setRows(transformedData);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equityRefresh]);

  useEffect(() => {
    setEquityTotal(totalEquity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalEquity]);

  return (
    <>
      <EditEquityDialog
        open={openEditEquityDialog}
        handleClose={handleEditClose}
        endpoint={endpoint}
        setEquityRefresh={setEquityRefresh}
        equityRefresh={equityRefresh}
        row={currentRow}
      />
      <ConfrirmDeleteEquityDialog
        open={openConfirmDeleteEquity}
        setOpen={setOpenConfirmDeleteEquity}
        setEquityRefresh={setEquityRefresh}
        equityRefresh={equityRefresh}
        row={currentRow}
        setCurrentRow={setCurrentRow}
      />

      <Grid container style={{ height: "100%" }}>
      <Grid item xs={12}>
          <AddEquityButton
            endpoint={endpoint}
            setEquityRefresh={setEquityRefresh}
            equityRefresh={equityRefresh}
          />
        </Grid>
        <Grid item xs={12}>
          <Paper
            sx={{
              width: "100%",
              overflow: "hidden",
              paddingLeft: 5,
              paddingRight: 5,
              backgroundColor: "#1b262c",
            }}
          >
            <TableContainer
              style={{ maxHeight: height }}
              sx={{
                "& .MuiTableRow-root:hover": {
                  backgroundColor: "#333",
                },
              }}
            >
              <Table stickyHeader aria-label="sticky table" size="small">
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <StyledTableCell
                        key={column.id}
                        align={column.align}
                        style={{
                          width: column.width,
                          backgroundColor: "#0f4c75",
                        }}
                      >
                        {column.label}
                      </StyledTableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {rows.map((row) => {
                    return (
                      <TableRow
                        hover={true}
                        role="checkbox"
                        tabIndex={-1}
                        key={row.code}
                      >
                        {columns.map((column) => {
                          const value = row[column.id];
                          return (
                            <StyledTableCell
                              key={column.id}
                              align={column.align}
                            >
                              {column.id === "icon" ? (
                                <>
                                  <IconButton onClick={() => handleEdit(row)}>
                                    <EditIcon style={{ fill: "white" }} />
                                  </IconButton>
                                  <IconButton onClick={() => handleDelete(row)}>
                                    <DeleteIcon style={{ fill: "white" }} />
                                  </IconButton>
                                </>
                              ) : (
                                <></>
                              )}
                              {column.format && typeof value === "number" ? (
                                <div style={{ color: column?.color(value) }}>
                                  {column.format(value)}
                                </div>
                              ) : (
                                value
                              )}
                            </StyledTableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                  <TableRow>
                    <StyledTableCell />
                    <StyledTableCell />
                    <StyledTableCell />
                    <StyledTableCell style={{ textAlign: "center" }}>
                      Total:
                    </StyledTableCell>
                    <StyledTableCell style={{ textAlign: "center" }}>
                      {formattedTotalEquity}
                    </StyledTableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
