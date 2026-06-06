import { Grid } from "@mui/material";
import { useContext } from "react";
import Donut from "./Donut";
import { AppContext } from "../AppContext";

export default function HomeSummary({ composition, title }) {


  let {vanguardRetirementTotal} = useContext(AppContext);
  let {tspTotal} = useContext(AppContext);
  let {vanguardBrokerageTotal} = useContext(AppContext);
  let {pa529Total} = useContext(AppContext);
  let {cryptoTotal} = useContext(AppContext);
  let {baskTotal} = useContext(AppContext);
  let {equityTotal} = useContext(AppContext);

  let {mortgageTotal} = useContext(AppContext);
  let {studentLoanTotal} = useContext(AppContext);
  let {autoLoanTotal} = useContext(AppContext);


  let investmentSummary = {
    retirement: vanguardRetirementTotal + tspTotal,
    brokerage: vanguardBrokerageTotal,
    college: pa529Total,
    cryptoTotal: cryptoTotal,
    emergency: baskTotal,
    equity: equityTotal
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
