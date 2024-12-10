import AddCryptoButton from "./AddCryptoButton";
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
  Button,
} from "@mui/material";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import "./Crypto.css";
import { withStyles } from "@mui/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ConfrirmDeleteCryptoDialog from "./ConfirmDeleteCryptoDialog.js";
import EditCryptoDialog from "./EditCryptoDialog";
import CalculateGainsButton from "./CalculateGainsButton.js";
import { getColumns } from "./CryptoTableData";
import { AppContext } from "../../../AppContext";

const StyledTableCell = withStyles({
  root: {
    color: "white",
  },
})(TableCell);

const columns = getColumns();

export default function Crypto() {
  //initialize vars
  let [openConfirmDeleteCrypto, setOpenConfirmDeleteCrypto] = useState(false);
  let [openEditCryptoDialog, setOpenEditCryptoDialog] = useState(false);
  let [currentRow, setCurrentRow] = useState({});
  let height = window.innerHeight * 0.89;
  let endpoint = `http://localhost:3001/crypto`;

  let { cryptoRefresh, setCryptoRefresh } = useContext(AppContext);
  let { cryptoData, setCryptoData } = useContext(AppContext);
  let { cryptoMarketRefresh, setCryptoMarketRefresh } = useContext(AppContext);
  let { setCryptoTotal } = useContext(AppContext);

  async function getCryptoDBData() {
    try {
      let res = await axios.get("http://localhost:3001/crypto");
      return res.data;
    } catch (err) {
      console.log(err);
      return;
    }
  }

  async function fetchCryptoMarketData(idTags) {
    try {
      let params = {
        idTags: idTags.join(","),
      };
      let res = await axios.get("http://localhost:3001/crypto-market", {
        params,
      });
      return res.data;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  const getCryptoMarketData = async (idTags) => {
    let cryptoMarketDataAPI = [];
    try {
      cryptoMarketDataAPI = await fetchCryptoMarketData(idTags);
    } catch (error) {
      console.error("error retrieving crypto data");
    }
    return cryptoMarketDataAPI;
  };

  // Calculate total value and total return
  const totalValue = cryptoData.reduce((total, row) => total + row.value, 0);
  // Format totalValue and totalReturn as currency (US format)
  const formattedTotalValue = totalValue.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  //Calculate total gains/losses
  const totalGains = cryptoData.reduce((total, row) => total + row.gains, 0);
  // Format totalValue and totalReturn as currency (US format)
  const formattedTotalGains = totalGains.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  const handleEdit = (row) => {
    setCurrentRow(row);
    setOpenEditCryptoDialog(true);
  };

  const handleEditClose = () => {
    setCurrentRow({});
    setOpenEditCryptoDialog(false);
  };

  const handleDelete = (row) => {
    setCurrentRow(row);
    setOpenConfirmDeleteCrypto(true);
  };

  useEffect(() => {
    setCryptoTotal(totalValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalValue]);

  return (
    <>
      <ConfrirmDeleteCryptoDialog
        open={openConfirmDeleteCrypto}
        setOpen={setOpenConfirmDeleteCrypto}
        setCryptoRefresh={setCryptoRefresh}
        cryptoRefresh={cryptoRefresh}
        row={currentRow}
        setCurrentRow={setCurrentRow}
      />
      <EditCryptoDialog
        open={openEditCryptoDialog}
        handleClose={handleEditClose}
        endpoint={endpoint}
        setCryptoRefresh={setCryptoRefresh}
        cryptoRefresh={cryptoRefresh}
        row={currentRow}
      />

      <Grid container style={{ height: "100%" }}>
        <Grid item>
          <AddCryptoButton
            endpoint={endpoint}
            setCryptoRefresh={setCryptoRefresh}
            cryptoRefresh={cryptoRefresh}
          />
        </Grid>
        <Grid item>
          {/* <CalculateGainsButton
            cryptoData={cryptoData}
          /> */}
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
                  {cryptoData.map((row) => {
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
                              {column.id === "icon" && (
                                <>
                                  <IconButton onClick={() => handleEdit(row)}>
                                    <EditIcon style={{ fill: "white" }} />
                                  </IconButton>
                                  <IconButton onClick={() => handleDelete(row)}>
                                    <DeleteIcon style={{ fill: "white" }} />
                                  </IconButton>
                                </>
                              )}
                              {column.id === "url" && (
                                <>
                                  {value && (
                                    <Button
                                      component="a"
                                      href={value}
                                      target="_blank"
                                      style={{
                                        marginRight: "10px",
                                        color: "white",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "flex-end",
                                        textDecoration: "underline",
                                        textDecorationColor: "#3282B8",
                                      }}
                                    >
                                      <span
                                        style={{
                                          alignSelf: "flex-start",
                                          color: "#3282B8",
                                          textTransform: "none",
                                        }}
                                      >
                                        See Chart
                                      </span>
                                    </Button>
                                  )}
                                </>
                              )}
                              {column.format && typeof value === "number" ? (
                                <div style={{ color: column?.color(value) }}>
                                  {column.format(value)}
                                </div>
                              ) : column.id === "url" ? (
                                ""
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
                    <StyledTableCell />
                    <StyledTableCell />
                    <StyledTableCell style={{ textAlign: "center" }}>
                      Total:
                    </StyledTableCell>
                    <StyledTableCell style={{ textAlign: "center" }}>
                      {formattedTotalValue}
                    </StyledTableCell>
                    <StyledTableCell style={{ textAlign: "center" }}>
                      {formattedTotalGains}
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
