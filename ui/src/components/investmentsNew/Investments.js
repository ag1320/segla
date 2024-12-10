import React, { useState } from "react";
import { Collapse, Typography, IconButton, Grid, Button } from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Summary from './InvestmentSummary.js'
import VanguardBrokerage from './vanguard/VanguardBrokerage.js'
import PA529 from './pa529/PA529.js'
import Crypto from './crypto/Crypto.js'

export default function Investments() {
  const [vanguardExpanded, setVanguardExpanded] = useState(true);
  const [pa529Expanded, setPa529Expanded] = useState(true);
  const [cryptoExpanded, setCryptoExpanded] = useState(true);

  const handleVanguardToggle = () => {
    setVanguardExpanded(!vanguardExpanded);
  };

  const handlePa529Toggle = () => {
    setPa529Expanded(!pa529Expanded);
  };

  const handleCryptoToggle = () => {
    setCryptoExpanded(!cryptoExpanded);
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
                <VanguardBrokerage />
              </Grid>
            </Grid>
          </Collapse>
        </Grid>

        <Grid item xs={12}></Grid>

        <Grid item xs="auto">
          <IconButton onClick={handlePa529Toggle} style={{ marginRight: "10px" }}>
            {pa529Expanded ? (
              <ExpandLessIcon style={{ fill: "white" }} />
            ) : (
              <ExpandMoreIcon style={{ fill: "white" }} />
            )}
          </IconButton>
        </Grid>
        <Grid item xs="auto">
          <IconButton onClick={handlePa529Toggle}>
            <Typography variant="h6" color={"white"}>
              Pennsylvania 529
            </Typography>
          </IconButton>
        </Grid>
        <Grid item xs="auto">
          <Button
            component="a"
            href="https://www.pa529.com/"
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
          <Collapse in={pa529Expanded}>
            <Grid container style={{ height: "100%", margin: "5px" }}>
              <Grid item xs={12}>
                <hr style={{ border: "1px solid #ccc" }} />
              </Grid>
              <Grid item xs={12} style={{ margin: "10px" }}>
                <PA529 />
              </Grid>
            </Grid>
          </Collapse>
        </Grid>

        <Grid item xs={12}></Grid>

        <Grid item xs="auto">
          <IconButton onClick={handleCryptoToggle} style={{ marginRight: "10px" }}>
            {cryptoExpanded ? (
              <ExpandLessIcon style={{ fill: "white" }} />
            ) : (
              <ExpandMoreIcon style={{ fill: "white" }} />
            )}
          </IconButton>
        </Grid>
        <Grid item xs="auto">
          <IconButton onClick={handleCryptoToggle}>
            <Typography variant="h6" color={"white"}>
              Cryptocurrency
            </Typography>
          </IconButton>
        </Grid>
        <Grid item xs="auto">
          <Button
            component="a"
            href="https://www.coinbase.com/advanced-trade"
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
          <Collapse in={cryptoExpanded}>
            <Grid container style={{ height: "100%", margin: "5px" }}>
              <Grid item xs={12}>
                <hr style={{ border: "1px solid #ccc" }} />
              </Grid>
              <Grid item xs={12} style={{ margin: "10px" }}>
                <Crypto />
              </Grid>
            </Grid>
          </Collapse>
        </Grid>
      </Grid>
    </>
  );
}
