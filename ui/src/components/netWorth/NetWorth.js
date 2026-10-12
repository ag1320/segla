import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Box, Button, Chip, Grid } from "@mui/material";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import "../Home.css";
import NetWorthSummary from "./NetWorthSummary";
import NetWorthChart from "./NetWorthChart";
import SnapshotHistory from "./SnapshotHistory";
import WhatChanged from "./WhatChanged";
import SavingsRate from "./SavingsRate";
import { loadNetWorthSnapshots, captureNetWorthSnapshot, loadMonthlyCashFlow } from "../../state/netWorthSlice";
import { setSnackbarSuccess, setSnackbarError } from "../../state/uiSlice";
import { loadVanguardRetirement } from "../../state/vanguardRetirementSlice";
import { loadTsp } from "../../state/tspSlice";
import { loadVanguardBrokerage } from "../../state/vanguardBrokerageSlice";
import { loadPa529 } from "../../state/pa529Slice";
import { loadBask } from "../../state/baskSlice";
import { loadLoans } from "../../state/loansSlice";
import { loadEquity } from "../../state/equitySlice";

export default function NetWorth() {
  const dispatch = useDispatch();
  const [capturing, setCapturing] = useState(false);

  // Snapshot history, budget income/expenses (Savings Rate), plus every
  // domain the live "Current Net Worth" total depends on (same set Home.js
  // loads; crypto is loaded globally in App.js).
  useEffect(() => {
    dispatch(loadNetWorthSnapshots());
    // 60 months covers the Savings Rate chart's longest (5Y) range
    dispatch(loadMonthlyCashFlow(60));
    dispatch(loadVanguardRetirement());
    dispatch(loadTsp());
    dispatch(loadVanguardBrokerage());
    dispatch(loadPa529());
    dispatch(loadBask());
    dispatch(loadLoans());
    dispatch(loadEquity());
  }, [dispatch]);

  const handleCapture = () => {
    setCapturing(true);
    dispatch(captureNetWorthSnapshot())
      .unwrap()
      .then(() => dispatch(setSnackbarSuccess(true)))
      .catch(() => dispatch(setSnackbarError(true)))
      .finally(() => setCapturing(false));
  };

  return (
    <Box className="content-box">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <NetWorthSummary />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleCapture} disabled={capturing} sx={{ px: 0 }}>
              <Chip
                avatar={<CameraAltOutlinedIcon style={{ color: "white" }} />}
                label={capturing ? "CAPTURING..." : "CAPTURE NOW"}
                variant="outlined"
                style={{ color: "white" }}
              />
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <NetWorthChart />
        </Grid>

        <Grid item xs={12} md={5}>
          <WhatChanged />
        </Grid>

        <Grid item xs={12} md={7}>
          <SavingsRate />
        </Grid>

        <Grid item xs={12}>
          <SnapshotHistory />
        </Grid>

        <Grid item xs={12} className="page-margin" />
      </Grid>
    </Box>
  );
}
