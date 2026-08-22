import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Collapse, Typography, IconButton, Grid } from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Summary from "./LoanSummary.js";
import Loan from "./loan/Loan.js";
import AddAccountButton from "./AddAccountButton.js";
import Equity from "./equity/Equity.js";
import { loadLoans } from "../../state/loansSlice";

export default function Loans() {
  const dispatch = useDispatch();
  //if you add a type of loan, make sure to update the loan categories in addaccountdialog
  const [studentLoanExpanded, setStudentLoanExpanded] = useState(true);
  const [mortgageExpanded, setMortgageExpanded] = useState(true);
  const [autoLoanExpanded, setAutoLoanExpanded] = useState(true);
  let [currentRow, setCurrentRow] = useState({});

  const handleStudentLoanToggle = () => {
    setStudentLoanExpanded(!studentLoanExpanded);
  };

  const handleMortgageToggle = () => {
    setMortgageExpanded(!mortgageExpanded);
  };

  const handleAutoLoanToggle = () => {
    setAutoLoanExpanded(!autoLoanExpanded);
  };

  //on page load, get data
  useEffect(() => {
    dispatch(loadLoans());
  }, [dispatch]);

  return (
    <>
      <Grid container style={{ height: "100%", margin: "20px" }}>
        <Grid item xs={12}>
          <Summary />
        </Grid>

        <Grid item xs={12}>
          <AddAccountButton />
        </Grid>

        <Grid item xs="auto">
          <IconButton
            onClick={handleStudentLoanToggle}
            style={{ marginRight: "10px" }}
          >
            {studentLoanExpanded ? (
              <ExpandLessIcon style={{ fill: "white" }} />
            ) : (
              <ExpandMoreIcon style={{ fill: "white" }} />
            )}
          </IconButton>
        </Grid>
        <Grid item xs="auto">
          <IconButton onClick={handleStudentLoanToggle}>
            <Typography variant="h6" color={"white"}>
              Student Loans
            </Typography>
          </IconButton>
        </Grid>
        <Grid item xs="auto"></Grid>
        <Grid item xs={12}>
          <Collapse in={studentLoanExpanded}>
            <Grid container style={{ height: "100%", margin: "5px" }}>
              <Grid item xs={12}>
                <hr style={{ border: "1px solid #ccc" }} />
              </Grid>
              <Grid item xs={12} style={{ margin: "10px" }}>
                <Loan
                  currentRow={currentRow}
                  setCurrentRow={setCurrentRow}
                  accountType={"Student Loan"}
                />
              </Grid>
            </Grid>
          </Collapse>
        </Grid>

        <Grid item xs="auto">
          <IconButton
            onClick={handleMortgageToggle}
            style={{ marginRight: "10px" }}
          >
            {mortgageExpanded ? (
              <ExpandLessIcon style={{ fill: "white" }} />
            ) : (
              <ExpandMoreIcon style={{ fill: "white" }} />
            )}
          </IconButton>
        </Grid>
        <Grid item xs="auto">
          <IconButton onClick={handleMortgageToggle}>
            <Typography variant="h6" color={"white"}>
              Mortgages and Equities
            </Typography>
          </IconButton>
        </Grid>
        <Grid item xs="auto"></Grid>
        <Grid item xs={12}>
          <Collapse in={mortgageExpanded}>
            <Grid container style={{ height: "100%", margin: "5px" }}>
              <Grid item xs={12}>
                <hr style={{ border: "1px solid #ccc" }} />
              </Grid>
              <Grid item xs={12} style={{ margin: "10px" }}>
                <Loan
                  currentRow={currentRow}
                  setCurrentRow={setCurrentRow}
                  accountType={"Mortgage"}
                />
              </Grid>
              <Grid item xs={12} style={{ margin: "10px" }}>
                <Equity />
              </Grid>
            </Grid>
          </Collapse>
        </Grid>

        <Grid item xs="auto">
          <IconButton
            onClick={handleAutoLoanToggle}
            style={{ marginRight: "10px" }}
          >
            {autoLoanExpanded ? (
              <ExpandLessIcon style={{ fill: "white" }} />
            ) : (
              <ExpandMoreIcon style={{ fill: "white" }} />
            )}
          </IconButton>
        </Grid>
        <Grid item xs="auto">
          <IconButton onClick={handleAutoLoanToggle}>
            <Typography variant="h6" color={"white"}>
              Auto Loans
            </Typography>
          </IconButton>
        </Grid>
        <Grid item xs="auto"></Grid>
        <Grid item xs={12}>
          <Collapse in={autoLoanExpanded}>
            <Grid container style={{ height: "100%", margin: "5px" }}>
              <Grid item xs={12}>
                <hr style={{ border: "1px solid #ccc" }} />
              </Grid>
              <Grid item xs={12} style={{ margin: "10px" }}>
                <Loan
                  currentRow={currentRow}
                  setCurrentRow={setCurrentRow}
                  accountType={"Auto Loan"}
                />
              </Grid>
            </Grid>
          </Collapse>
        </Grid>
      </Grid>
    </>
  );
}
