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
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./VanguardBrokerage.css";
import { withStyles } from "@mui/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ConfrirmDeleteAccountDialog from "./ConfirmDeleteAccountDialog.js";
import EditVanguardAccountDialog from "./EditVanguardAccountDialog";
import { getColumns } from "./VanguardBrokerageTableData";
import { loadVanguardBrokerage } from "../../../state/vanguardBrokerageSlice";
import AccountCard from "../../AccountCard";

const StyledTableCell = withStyles({
  root: {
    color: "white",
  },
})(TableCell);

const columns = getColumns();

export default function VanguardBrokerage() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const rows = useSelector((state) => state.vanguardBrokerage.items);

  //initialize vars
  let [openConfirmDeleteAccount, setOpenConfirmDeleteAccount] = useState(false);
  let [openEditAccountDialog, setOpenEditAccountDialog] = useState(false);
  let [currentRow, setCurrentRow] = useState({});
  let height = window.innerHeight * 0.89;

  // Calculate total value and total return
  const totalValue = rows.reduce((total, row) => total + row.value, 0);
  const totalReturn = rows.reduce((total, row) => total + row.return, 0);
  // Format totalValue and totalReturn as currency (US format)
  const formattedTotalValue = totalValue.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  const formattedTotalReturn = totalReturn.toLocaleString("en-US", {
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

  //on page load, get data
  useEffect(() => {
    dispatch(loadVanguardBrokerage());
  }, [dispatch]);

  return (
    <>
      <ConfrirmDeleteAccountDialog
        open={openConfirmDeleteAccount}
        setOpen={setOpenConfirmDeleteAccount}
        row={currentRow}
        setCurrentRow={setCurrentRow}
      />
      <EditVanguardAccountDialog
        open={openEditAccountDialog}
        handleClose={handleEditClose}
        row={currentRow}
      />

      <Grid container style={{ height: "100%" }}>
        <Grid item xs={12}>
          <AddAccountButton />
        </Grid>

        <Grid item xs={12}>
          {isMobile ? (
            <>
              {rows.map((row) => (
                <AccountCard
                  key={row.code}
                  row={row}
                  columns={columns}
                  actions={
                    <>
                      <IconButton size="small" onClick={() => handleEdit(row)}>
                        <EditIcon style={{ fill: "white" }} fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(row)}>
                        <DeleteIcon style={{ fill: "white" }} fontSize="small" />
                      </IconButton>
                    </>
                  }
                />
              ))}
              <AccountCard
                row={{ value: totalValue, return: totalReturn }}
                columns={columns}
                isTotal
              />
            </>
          ) : (
          <Paper
            sx={{
              width: "100%",
              overflow: "hidden",
              px: { xs: 1, sm: 5 },
              backgroundColor: "#1b262c",
            }}
          >
            <TableContainer
              sx={{
                // Below "sm" the table only scrolls horizontally, not
                // vertically too - a box panning in both directions fights
                // itself on a touch screen (a horizontal swipe can get read
                // as the vertical scroll instead). The Table's own minWidth
                // below is what drives the horizontal scroll predictably;
                // percentage column widths against unbreakable multi-word
                // headers were making real column proportions erratic.
                maxHeight: { xs: "none", sm: height },
                "& .MuiTableRow-root:hover": {
                  backgroundColor: "#333",
                },
              }}
            >
              <Table stickyHeader aria-label="sticky table" size="small" sx={{ minWidth: 780 }}>
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
                    <StyledTableCell />
                    <StyledTableCell style = {{textAlign: "center"}}>Total:</StyledTableCell>
                    <StyledTableCell style = {{textAlign: "center"}}>{formattedTotalValue}</StyledTableCell>
                    <StyledTableCell style = {{textAlign: "center"}}>{formattedTotalReturn}</StyledTableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          )}
        </Grid>
      </Grid>
    </>
  );
}
