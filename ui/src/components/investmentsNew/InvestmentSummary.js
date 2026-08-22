import { useSelector } from "react-redux";
import { selectInvestmentTotals } from "../../utilities/helperFunctions";
import { Paper, Box, Typography } from "@mui/material";

export default function Summary() {
  const { vanguardBrokerageTotal, pa529Total, cryptoTotal } = useSelector(selectInvestmentTotals);
  let investmentTotal = (vanguardBrokerageTotal?vanguardBrokerageTotal:0 ) + (pa529Total?pa529Total:0) + (cryptoTotal?cryptoTotal:0);

  return (
    <>
      <Paper
        sx={{
          backgroundImage: "linear-gradient(to right, #1B262C, #556B78, #1B262C)",
          color: "#FFF",
          padding: "16px",
          marginLeft: "100px",
          marginRight: "100px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box textAlign="center">
          <Typography variant="h6" component="div">
            Total Investment Value
          </Typography>
          <Typography variant="h4" component="div">
            {investmentTotal.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </Typography>
        </Box>
      </Paper>
    </>
  );
}
