import { useContext } from "react";
import { AppContext } from "../../AppContext";
import { Paper, Box, Typography, Grid } from "@mui/material";

export default function Summary() {
  let { mortgageTotal, studentLoanTotal, autoLoanTotal } =
    useContext(AppContext);
  let { equityTotal } = useContext(AppContext);
  let loanTotal =
    (mortgageTotal ? mortgageTotal : 0) +
    (studentLoanTotal ? studentLoanTotal : 0) +
    (autoLoanTotal ? autoLoanTotal : 0);

  return (
    <>
      <Paper
        sx={{
          backgroundImage:
            "linear-gradient(to right, #1B262C, #556B78, #1B262C)",
          color: "#FFF",
          padding: "16px",
          marginLeft: "100px",
          marginRight: "100px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Grid container alignItems="center" justifyContent="center">
          <Grid item xs={12}>
            <Typography
              variant="h6"
              component="div"
              sx={{ textAlign: "center" }}
            >
              Total Estimated Equity
            </Typography>
            <Typography
              variant="h4"
              component="div"
              sx={{ textAlign: "center" }}
            >
              {equityTotal.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography
              variant="h6"
              component="div"
              sx={{ textAlign: "center" }}
            >
              Total Loan Balance
            </Typography>
            <Typography
              variant="h4"
              component="div"
              sx={{ textAlign: "center" }}
            >
              {loanTotal.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
}
