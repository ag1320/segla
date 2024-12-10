import React, { useState } from "react";
import { Collapse, Typography, IconButton, Grid, Button } from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import VanguardRetirement from "./vanguardRetirement/VanguardRetirement.js";
import TSP from "./tsp/TSP.js";
import Summary from "./RetirementSummary.js";

export default function Retirement() {
  const [vanguardExpanded, setVanguardExpanded] = useState(true);
  const [tspExpanded, setTspExpanded] = useState(true);

  const handleVanguardToggle = () => {
    setVanguardExpanded(!vanguardExpanded);
  };

  const handleTspToggle = () => {
    setTspExpanded(!tspExpanded);
  };

  return (
    <>
      <Grid container style={{ height: "100%", margin: "20px" }}>
        <Grid item xs={12}>
          <Summary />
        </Grid>

        <Grid item xs="auto">
          <IconButton
            onClick={handleVanguardToggle}
            style={{ marginRight: "10px" }}
          >
            {vanguardExpanded ? (
              <ExpandLessIcon style={{ fill: "white" }} />
            ) : (
              <ExpandMoreIcon style={{ fill: "white" }} />
            )}
          </IconButton>
        </Grid>
        <Grid item xs="auto">
          <IconButton onClick={handleVanguardToggle}>
            <Typography variant="h6" color={"white"}>
              Vanguard
            </Typography>
          </IconButton>
        </Grid>
        <Grid item xs="auto">
          <Button
            component="a"
            href="https://investor.vanguard.com/home"
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
              Go To
            </span>
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Collapse in={vanguardExpanded}>
            <Grid container style={{ height: "100%", margin: "5px" }}>
              <Grid item xs={12}>
                <hr style={{ border: "1px solid #ccc" }} />
              </Grid>
              <Grid item xs={12} style={{ margin: "10px" }}>
                <VanguardRetirement />
              </Grid>
            </Grid>
          </Collapse>
        </Grid>

        <Grid item xs={12}></Grid>

        <Grid item xs="auto">
          <IconButton onClick={handleTspToggle} style={{ marginRight: "10px" }}>
            {tspExpanded ? (
              <ExpandLessIcon style={{ fill: "white" }} />
            ) : (
              <ExpandMoreIcon style={{ fill: "white" }} />
            )}
          </IconButton>
        </Grid>
        <Grid item xs="auto">
          <IconButton onClick={handleTspToggle}>
            <Typography variant="h6" color={"white"}>
              Thrift Savings Plan
            </Typography>
          </IconButton>
        </Grid>
        <Grid item xs="auto">
          <Button
            component="a"
            href="https://tsp.gov"
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
              Go To
            </span>
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Collapse in={tspExpanded}>
            <Grid container style={{ height: "100%", margin: "5px" }}>
              <Grid item xs={12}>
                <hr style={{ border: "1px solid #ccc" }} />
              </Grid>
              <Grid item xs={12} style={{ margin: "10px" }}>
                <TSP />
              </Grid>
            </Grid>
          </Collapse>
        </Grid>
      </Grid>
    </>
  );
}
