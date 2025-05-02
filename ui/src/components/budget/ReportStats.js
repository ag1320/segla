import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from "@mui/material";

const ReportStats = ({ data }) => {
  // Calculate the average for a given category
  const calculateAverage = (arr) => {
    const sum = arr.reduce((acc, val) => acc + val, 0);
    return (sum / arr.length).toFixed(2); // Average with 2 decimal places
  };

  // Find the minimum value for a given category
  const calculateMin = (arr) => {
    return Math.min(...arr);
  };

  // Find the maximum value for a given category
  const calculateMax = (arr) => {
    return Math.max(...arr);
  };

  // Find the month(s) of highest spending
  const extractHighestSpendMonth = (arr, labels) => {
    if (arr.length === 0 || !arr) return "N/A";
    const maxValue = calculateMax(arr);
    const maxIndices = arr
      .map((value, index) => (value === maxValue ? index : -1))
      .filter((index) => index !== -1);
    const months = maxIndices.map((index) => {
      const [month, year] = labels[index];
      return `${month} ${year}`;
    });
    return months.join(", ");
  };

  return (
    <TableContainer component={Paper}>
      <Typography variant="h5" align="center" gutterBottom>
        Summary
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Category</TableCell>
            <TableCell align="right">Average</TableCell>
            <TableCell align="right">Min</TableCell>
            <TableCell align="right">Max</TableCell>
            <TableCell align="right">Month of Max Spending</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.datasets.map((category, index) => (
            <TableRow key={category.label}>
              <TableCell component="th" scope="row">
                {category.label}
              </TableCell>
              <TableCell align="right">
                {`$${calculateAverage(category.data)}`}
              </TableCell>
              <TableCell align="right">{`$${calculateMin(category.data).toFixed(2)}`}</TableCell>
              <TableCell align="right">{`$${calculateMax(category.data).toFixed(2)}`}</TableCell>
              <TableCell align="right">
                {extractHighestSpendMonth(category.data, data.labels)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ReportStats;
