import { useContext } from "react";
import { AppContext } from "../../AppContext";
import { Paper, Box, Typography } from "@mui/material";

export default function Summary() {
  let { vanguardRetirementTotal, tspTotal } = useContext(AppContext);
  let retirementTotal = (vanguardRetirementTotal? vanguardRetirementTotal:0) + (tspTotal?tspTotal:0);

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
            Total Retirement Value
          </Typography>
          <Typography variant="h4" component="div">
            {retirementTotal.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </Typography>
        </Box>
      </Paper>
    </>
  );
}
