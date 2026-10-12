import { useSelector } from "react-redux";
import { Paper, Box, Grid, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { selectNetWorthTotals, getNetWorthChanges } from "../../utilities/helperFunctions";
import { formatCurrency, formatSigned, formatDate, changeColor } from "./netWorthFormat";

function ChangeStat({ label, change, compact }) {
  return (
    <Box textAlign="center">
      <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", display: "block" }}>
        {label}
      </Typography>
      {change ? (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: changeColor(change.amount),
              fontWeight: 700,
            }}
          >
            {change.amount < 0 ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />}
            <Typography variant={compact ? "body2" : "h6"} component="span" sx={{ fontWeight: 700 }}>
              {formatSigned(change.amount, compact)}
            </Typography>
          </Box>
          {change.percent !== null && (
            <Typography variant="caption" sx={{ color: changeColor(change.amount) }}>
              {`${change.percent >= 0 ? "+" : ""}${change.percent.toFixed(1)}%`}
            </Typography>
          )}
        </>
      ) : (
        <Typography variant={compact ? "body2" : "h6"} sx={{ color: "rgba(255,255,255,0.5)" }}>
          —
        </Typography>
      )}
    </Box>
  );
}

export default function NetWorthSummary() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { totalAssets, totalLiabilities, netWorth } = useSelector(selectNetWorthTotals);
  const snapshots = useSelector((state) => state.netWorth.snapshots);
  const changes = getNetWorthChanges(snapshots, netWorth);
  const latest = snapshots[snapshots.length - 1];

  return (
    <Paper
      sx={{
        backgroundImage: "linear-gradient(to right, #1B262C, #556B78, #1B262C)",
        color: "#FFF",
        padding: { xs: "16px 8px", sm: "16px" },
        mx: { xs: 0, sm: 4, md: "100px" },
      }}
    >
      <Box textAlign="center">
        <Typography variant="h6" component="div">
          Current Net Worth
        </Typography>
        <Typography variant={isMobile ? "h5" : "h4"} component="div" sx={{ fontWeight: 700 }}>
          {formatCurrency(netWorth)}
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)", mt: 0.5 }}>
          {`Assets ${formatCurrency(totalAssets)} · Liabilities ${formatCurrency(totalLiabilities)}`}
        </Typography>
      </Box>

      <Grid container spacing={1} sx={{ mt: 1.5 }}>
        <Grid item xs={4}>
          <ChangeStat label="This Month" change={changes.sinceLastMonth} compact={isMobile} />
        </Grid>
        <Grid item xs={4}>
          <ChangeStat label="Year to Date" change={changes.yearToDate} compact={isMobile} />
        </Grid>
        <Grid item xs={4}>
          <ChangeStat label="All Time" change={changes.allTime} compact={isMobile} />
        </Grid>
      </Grid>

      {latest && (
        <Typography
          variant="caption"
          component="div"
          sx={{ textAlign: "center", color: "rgba(255,255,255,0.6)", mt: 1.5 }}
        >
          {`Tracking since ${formatDate(snapshots[0].date)} · last snapshot ${formatDate(latest.date)}`}
        </Typography>
      )}
    </Paper>
  );
}
