import React, { useState } from "react";
import { Collapse, Typography, IconButton, Grid, Button } from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Summary from './ReserveSummary.js'
import Bask from './bask/Bask.js'

export default function Reserve() {
  const [baskExpanded, setBaskExpanded] = useState(true);

  const handleBaskToggle = () => {
    setBaskExpanded(!baskExpanded);
  };


  return (
    <>
      <Grid container style={{ height: "100%", margin: "20px" }}>
        <Grid item xs={12}>
          <Summary />
        </Grid>

        <Grid item xs="auto">
          <IconButton
            onClick={handleBaskToggle}
            style={{ marginRight: "10px" }}
          >
            {baskExpanded ? (
              <ExpandLessIcon style={{ fill: "white" }} />
            ) : (
              <ExpandMoreIcon style={{ fill: "white" }} />
            )}
          </IconButton>
        </Grid>
        <Grid item xs="auto">
          <IconButton onClick={handleBaskToggle}>
            <Typography variant="h6" color={"white"}>
              Bask Bank
            </Typography>
          </IconButton>
        </Grid>
        <Grid item xs="auto">
          <Button
            component="a"
            href="https://www.baskbank.com/"
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
          <Collapse in={baskExpanded}>
            <Grid container style={{ height: "100%", margin: "5px" }}>
              <Grid item xs={12}>
                <hr style={{ border: "1px solid #ccc" }} />
              </Grid>
              <Grid item xs={12} style={{ margin: "10px" }}>
                <Bask />
              </Grid>
            </Grid>
          </Collapse>
        </Grid>

      </Grid>
    </>
  );
}
