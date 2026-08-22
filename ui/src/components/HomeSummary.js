import { Grid } from "@mui/material";
import { useSelector } from "react-redux";
import Donut from "./Donut";
import { selectInvestmentTotals, selectLoanTotals } from "../utilities/helperFunctions";

export default function HomeSummary({ composition, title }) {

  const {
    vanguardRetirementTotal,
    tspTotal,
    vanguardBrokerageTotal,
    pa529Total,
    cryptoTotal,
    baskTotal,
    houseValuationTotal,
  } = useSelector(selectInvestmentTotals);

  const { mortgageTotal, studentLoanTotal, autoLoanTotal } = useSelector(selectLoanTotals);

  let investmentSummary = {
    retirement: vanguardRetirementTotal + tspTotal,
    brokerage: vanguardBrokerageTotal,
    college: pa529Total,
    cryptoTotal: cryptoTotal,
    emergency: baskTotal,
    house: houseValuationTotal
  };

  let loanSummary = {
    mortgage: mortgageTotal,
    studentLoan: studentLoanTotal,
    auto: autoLoanTotal
  };

  return (
    <Grid container>
      <Grid item xs = {0} sm = {1} md = {1} lg = {2}/>
      <Grid item xs = {12} sm = {4} md = {4} lg = {3}>
        <Donut composition={investmentSummary} title="Assets" />
      </Grid>
      <Grid item xs = {0} sm = {2} md = {2}lg = {2}/>
      <Grid item xs = {12} sm = {4} md = {4}lg = {3}>
        <Donut composition={loanSummary} title="Loans" />
      </Grid>
      <Grid item xs = {0} sm = {1} md = {1} lg = {2}/>
    </Grid>
  );
}
