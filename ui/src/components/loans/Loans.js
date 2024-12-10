import React, { useState, useEffect } from "react";
import { Collapse, Typography, IconButton, Grid } from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Summary from "./LoanSummary.js";
import Loan from "./loan/Loan.js";
import AddAccountButton from "./AddAccountButton.js";
import axios from "axios";
import Equity from "./equity/Equity.js";

export default function Loans() {
  //if you add a type of loan, make sure to update the loan categories in addaccountdialog
  const [studentLoanExpanded, setStudentLoanExpanded] = useState(true);
  const [mortgageExpanded, setMortgageExpanded] = useState(true);
  const [autoLoanExpanded, setAutoLoanExpanded] = useState(true);
  let [accountsRefresh, setAccountsRefresh] = useState(false);
  let [rows, setRows] = useState([]);
  let [currentRow, setCurrentRow] = useState({});
  let endpoint = `http://localhost:3001/loans`;

  const handleStudentLoanToggle = () => {
    setStudentLoanExpanded(!studentLoanExpanded);
  };

  const handleMortgageToggle = () => {
    setMortgageExpanded(!mortgageExpanded);
  };

  const handleAutoLoanToggle = () => {
    setAutoLoanExpanded(!autoLoanExpanded);
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
          url: item.url,
          id: item.loan_account_id,
          holder: item.account_holder,
          type: item.type,
          interestRate: item.interest_rate,
          payoffDate: item.payoff_date,
          monthlyPayment: item.monthly_payment,
          remainingBalance: item.remaining_balance,
        }));
        setRows(transformedData);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountsRefresh]);

  return (
    <>
      <Grid container style={{ height: "100%", margin: "20px" }}>
        <Grid item xs={12}>
          <Summary />
        </Grid>

        <Grid item xs={12}>
          <AddAccountButton
            endpoint={endpoint}
            accountsRefresh={accountsRefresh}
            setAccountsRefresh={setAccountsRefresh}
          />
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
                  rows={rows}
                  endpoint={endpoint}
                  accountsRefresh={accountsRefresh}
                  setAccountsRefresh={setAccountsRefresh}
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
                  rows={rows}
                  endpoint={endpoint}
                  accountsRefresh={accountsRefresh}
                  setAccountsRefresh={setAccountsRefresh}
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
                  rows={rows}
                  endpoint={endpoint}
                  accountsRefresh={accountsRefresh}
                  setAccountsRefresh={setAccountsRefresh}
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
