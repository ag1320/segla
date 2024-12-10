import AddAccountButton from "./AddAccountButton";
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
import {  useState, useEffect, useContext } from "react";
import axios from "axios";
import "./Bask.css";
import { withStyles } from "@mui/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ConfrirmDeleteAccountDialog from "./ConfirmDeleteAccountDialog.js";
import EditBaskAccountDialog from "./EditBaskAccountDialog";
import { getColumns } from "./BaskTableData";
import { AppContext } from "../../../AppContext";


const StyledTableCell = withStyles({
  root: {
    color: "white",
  },
})(TableCell);

const columns = getColumns();

export default function Bask() {
  //initialize vars
  let [openConfirmDeleteAccount, setOpenConfirmDeleteAccount] = useState(false);
  let [openEditAccountDialog, setOpenEditAccountDialog] = useState(false);
  let [accountsRefresh, setAccountsRefresh] = useState(false);
  let [currentRow, setCurrentRow] = useState({});
  let [rows, setRows] = useState([]);
  let height = window.innerHeight * 0.89;
  let endpoint = `http://localhost:3001/bask`;
  let { setBaskTotal  } = useContext(AppContext);

  // Calculate total value and total return
  const totalValue = rows.reduce((total, row) => total + row.value, 0);
  const totalReturn = rows.reduce((total, row) => total + row.return, 0);
  const totalYtdReturn = rows.reduce((total, row) => total + row.ytdReturn, 0);
  // Format totalValue and totalReturn as currency (US format)
  const formattedTotalValue = totalValue.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  const formattedTotalReturn = totalReturn.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  const formattedYtdTotalReturn = totalYtdReturn.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  const handleEdit = (row) => {
    setCurrentRow(row);
    setOpenEditAccountDialog(true);
  };

  const handleEditClose = () => {
    setCurrentRow({});
    setOpenEditAccountDialog(false);
  };

  const handleDelete = (row) => {
    setCurrentRow(row);
    setOpenConfirmDeleteAccount(true);
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
          id: item.bask_account_id,
          interestRate: item.interest_rate,
          value: item.current_value,
          return: item.total_return,
          ytdReturn: item.ytd_return,
        }));
        setRows(transformedData);
      }
    });
    //setUrl(endpoint);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountsRefresh]);

  useEffect(() => {
    setBaskTotal(totalValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalValue]);

  return (
    <>
      <ConfrirmDeleteAccountDialog
        open={openConfirmDeleteAccount}
        setOpen={setOpenConfirmDeleteAccount}
        setAccountsRefresh={setAccountsRefresh}
        accountsRefresh={accountsRefresh}
        row={currentRow}
        setCurrentRow={setCurrentRow}
      />
      <EditBaskAccountDialog
        open={openEditAccountDialog}
        handleClose={handleEditClose}
        endpoint={endpoint}
        setAccountsRefresh={setAccountsRefresh}
        accountsRefresh={accountsRefresh}
        row={currentRow}
      />

      <Grid container style={{ height: "100%" }}>
        <Grid item xs={12}>
          <AddAccountButton
            endpoint={endpoint}
            setAccountsRefresh={setAccountsRefresh}
            accountsRefresh={accountsRefresh}
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
                    <StyledTableCell style = {{textAlign: "center"}}>Total:</StyledTableCell>
                    <StyledTableCell style = {{textAlign: "center"}}>{formattedTotalValue}</StyledTableCell>
                    <StyledTableCell style = {{textAlign: "center"}}>{formattedYtdTotalReturn}</StyledTableCell>
                    <StyledTableCell style = {{textAlign: "center"}}>{formattedTotalReturn}</StyledTableCell>
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
