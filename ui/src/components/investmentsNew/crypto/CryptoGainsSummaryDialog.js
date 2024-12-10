import React, { useEffect, useState } from "react";
import {
  Dialog,
  Button,
  DialogActions,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  Paper,
  Box,
  DialogContent
} from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
};

export default function CalculateGainsSummaryDialog({  
  rows,
  openSummary,
  setOpenSummary,
  ticker,
  amountInvested
}) {
  const [selectedRow, setSelectedRow] = useState(null);
  const [formatValue, setFormatValue] = useState(null);
  const [formatAmountInvested, setFormatAmountInvested] = useState(null);
  const [gainsLosses, setGainsLosses] = useState(null);

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  const calculateCostBasis = (shares) => {
    return formatCurrency(amountInvested / shares);
  };

  const calculateGainsLosses = (shares, currentMarketValue) => {
    const gainsLosses = currentMarketValue * shares - amountInvested;
    return {
      amount: formatCurrency(gainsLosses),
      isPositive: gainsLosses >= 0,
    };
  };

  useEffect(() => {
    if (openSummary && rows && ticker && amountInvested) {
      const amountInvestedFloat = parseFloat(amountInvested);
      const selectedRow = rows.find((row) => row.ticker === ticker);
      const formatValue = formatCurrency(selectedRow.value);
      const formatAmountInvested = formatCurrency(amountInvestedFloat);
      const gainsLosses = calculateGainsLosses(
        selectedRow.shares,
        selectedRow.marketValue
      );

      setSelectedRow(selectedRow);
      setFormatValue(formatValue);
      setFormatAmountInvested(formatAmountInvested);
      setGainsLosses(gainsLosses);
    }
  }, [openSummary, rows, ticker, amountInvested]);

  const handleClose = () => {
    setOpenSummary(false);
  };

  return (
    <Box sx={style}>
      <Dialog open={openSummary} onClose={handleClose}>
        <DialogTitle>{`Summary Information for ${ticker}`}</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper} style={{ textAlign: "center" }}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <strong>Name:</strong> {selectedRow ? selectedRow.name : ""}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Ticker:</strong> {selectedRow ? selectedRow.ticker : ""}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Shares:</strong> {selectedRow ? selectedRow.shares : ""}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Amount Invested:</strong> {formatAmountInvested}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Value:</strong> {formatValue}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Cost Basis:</strong>{" "}
                    {selectedRow ? calculateCostBasis(selectedRow.shares) : ""}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Current Market Value:</strong>{" "}
                    {selectedRow ? formatCurrency(selectedRow.marketValue) : ""}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Gains/Losses:</strong>{" "}
                    <Typography
                      style={{
                        color: gainsLosses && gainsLosses.isPositive ? "green" : "red",
                      }}
                    >
                      {gainsLosses ? gainsLosses.amount : ""}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={handleClose}
            style={{ backgroundColor: "#0f4c75" }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
