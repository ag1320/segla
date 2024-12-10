import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../../AppContext";
import "./Loan.css";
import { withStyles } from "@mui/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ConfrirmDeleteAccountDialog from "../ConfirmDeleteAccountDialog.js";
import EditAccountDialog from "../EditAccountDialog";
import { getColumns } from "../TableData";
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
  Link,
} from "@mui/material";

const StyledTableCell = withStyles({
  root: {
    color: "white",
  },
})(TableCell);

const columns = getColumns();

export default function Loan({
  rows,
  endpoint,
  accountsRefresh,
  setAccountsRefresh,
  currentRow,
  setCurrentRow,
  accountType,
}) {
  //initialize vars
  let [openConfirmDeleteAccount, setOpenConfirmDeleteAccount] = useState(false);
  let [openEditAccountDialog, setOpenEditAccountDialog] = useState(false);
  let [filteredRows, setFilteredRows] = useState([]);
  let height = window.innerHeight * 0.89;

  let { setMortgageTotal, setStudentLoanTotal, setAutoLoanTotal } = useContext(AppContext);

  function filterRowsByType(typeToFilter) {
    filteredRows = rows.filter((row) => {
      return row.type === typeToFilter;
    });

    return filteredRows;
  }

  // Calculate totals
  const total = filteredRows.reduce((total, row) => total + row.remainingBalance, 0);
  const formattedTotal = total.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  useEffect(() => {
    setFilteredRows(filterRowsByType(accountType));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountsRefresh, rows]);

  useEffect(() => {
    switch (accountType) {
      case "Mortgage":
        setMortgageTotal(total);
        break;
      case "Student Loan":
        setStudentLoanTotal(total);
        break;
      case "Auto Loan":
        setAutoLoanTotal(total);
        break;
      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

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
      <EditAccountDialog
        open={openEditAccountDialog}
        handleClose={handleEditClose}
        endpoint={endpoint}
        setAccountsRefresh={setAccountsRefresh}
        accountsRefresh={accountsRefresh}
        row={currentRow}
      />

      <Grid container style={{ height: "100%" }}>
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
                  {filteredRows.map((row) => {
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
                                column.id === "url" ? (
                                  value && (
                                    <Link
                                      href={value}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      color="primary"
                                      underline="always"
                                    >
                                      Go To
                                    </Link>
                                  )
                                ) : column.id === "monthlyPayment" || column.id === "remainingBalance" ? (
                                  value.toLocaleString("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                    minimumFractionDigits: 2,
                                  })
                                ) : (
                                  value
                                )
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
                    <StyledTableCell />
                    <StyledTableCell />
                    <StyledTableCell style = {{textAlign: "center"}}>Total:</StyledTableCell>
                    <StyledTableCell style = {{textAlign: "center"}}>{formattedTotal}</StyledTableCell>
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
