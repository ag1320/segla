import { useState } from "react";
import { useSelector } from "react-redux";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import {
  Box,
  Grid,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { selectNetWorthTotals } from "../../utilities/helperFunctions";
import { formatCompact, formatCurrency, changeColor, POSITIVE_COLOR, NEGATIVE_COLOR } from "./netWorthFormat";
import { panelSx, toggleSx, mutedText } from "./netWorthStyles";
Chart.register(...registerables);

const NET_WORTH_COLOR = "rgb(0, 188, 212)";

// Months shown per range (YTD is computed from the current month). The
// longest range must stay within what NetWorth.js loads via loadMonthlyCashFlow.
const RANGES = [
  { id: "6M", label: "6M", months: 6 },
  { id: "YTD", label: "YTD" },
  { id: "1Y", label: "1Y", months: 12 },
  { id: "2Y", label: "2Y", months: 24 },
  { id: "3Y", label: "3Y", months: 36 },
  { id: "5Y", label: "5Y", months: 60 },
];

const monthsForRange = (rangeId) => RANGES.find((r) => r.id === rangeId).months || new Date().getMonth() + 1;

const pad2 = (n) => String(n).padStart(2, "0");
const monthKey = (date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
const formatPercent = (value) => (value === null ? "—" : `${value.toFixed(1)}%`);

// For each of the last monthsShown months (oldest first):
//  - savingsRate: (income - fixed - varied expenses) / income, from the
//    Budget data, so it has history from day one
//  - netWorthGrowth: change in net worth over the month / income. Includes
//    market moves and home value, so it can be far above or below the
//    savings rate. Only available once snapshots bracket the month.
function buildMonths(cashFlow, snapshots, liveNetWorth, monthsShown) {
  const now = new Date();
  const currentKey = monthKey(now);

  // Last snapshot dated before a "YYYY-MM-DD" string
  const lastBefore = (date) => {
    for (let i = snapshots.length - 1; i >= 0; i--) {
      if (snapshots[i].date < date) return snapshots[i];
    }
    return null;
  };

  return Array.from({ length: monthsShown }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (monthsShown - 1 - i), 1);
    const key = monthKey(date);
    const next = monthKey(new Date(date.getFullYear(), date.getMonth() + 1, 1));
    const { income = 0, fixedExpenses = 0, variedExpenses = 0 } = cashFlow[key] || {};
    const saved = income - fixedExpenses - variedExpenses;
    const inProgress = key === currentKey;

    const startSnap = lastBefore(`${key}-01`);
    const endSnap = lastBefore(`${next}-01`);
    // The month-end value for the current month is "now"
    const endValue = inProgress ? liveNetWorth : endSnap && endSnap.date >= `${key}-01` ? endSnap.netWorth : null;
    const netWorthChange = startSnap && endValue !== null ? endValue - startSnap.netWorth : null;

    return {
      key,
      label: date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      income,
      saved,
      inProgress,
      savingsRate: income > 0 ? (saved / income) * 100 : null,
      netWorthChange,
      netWorthGrowth: income > 0 && netWorthChange !== null ? (netWorthChange / income) * 100 : null,
    };
  });
}

function Stat({ label, value, color, sub, info, large }) {
  return (
    <Box textAlign="center">
      <Typography variant="caption" sx={{ color: mutedText, display: "inline-flex", alignItems: "center", gap: 0.5 }}>
        {label}
        {info && (
          <Tooltip title={info} arrow enterTouchDelay={0} leaveTouchDelay={5000}>
            <InfoOutlinedIcon sx={{ fontSize: 14, cursor: "help" }} />
          </Tooltip>
        )}
      </Typography>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: color || "#fff",
          lineHeight: 1.3,
          ...(large && { fontSize: { xs: "1.4rem", sm: "2rem" } }),
        }}
      >
        {value}
      </Typography>
      {sub && (
        <Typography variant="caption" sx={{ color: mutedText }}>
          {sub}
        </Typography>
      )}
    </Box>
  );
}

export default function SavingsRate() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const cashFlow = useSelector((state) => state.netWorth.monthlyCashFlow);
  const snapshots = useSelector((state) => state.netWorth.snapshots);
  const { netWorth } = useSelector(selectNetWorthTotals);
  const [range, setRange] = useState("1Y");

  const months = buildMonths(cashFlow, snapshots, netWorth, monthsForRange(range));
  // Stats use finished months only - a half-entered current month would
  // drag the average around all month long.
  const complete = months.filter((m) => !m.inProgress && m.income > 0);
  const totalIncome = complete.reduce((sum, m) => sum + m.income, 0);
  const totalSaved = complete.reduce((sum, m) => sum + m.saved, 0);
  const avgRate = totalIncome > 0 ? (totalSaved / totalIncome) * 100 : null;
  const avgSaved = complete.length ? totalSaved / complete.length : null;
  const lastMonth = complete[complete.length - 1];
  const hasNetWorthGrowth = months.some((m) => m.netWorthGrowth !== null);
  const money = (value) => (isMobile ? formatCompact(value) : formatCurrency(value));

  const data = {
    labels: months.map((m) => (m.inProgress ? `${m.label}*` : m.label)),
    datasets: [
      {
        type: "bar",
        label: "Savings Rate",
        data: months.map((m) => m.savingsRate),
        backgroundColor: months.map((m) =>
          m.savingsRate !== null && m.savingsRate < 0 ? `${NEGATIVE_COLOR}b3` : `${POSITIVE_COLOR}b3`
        ),
        borderRadius: 4,
        yAxisID: "y",
        order: 1,
      },
      ...(hasNetWorthGrowth
        ? [
            {
              type: "line",
              label: "Net Worth Growth ÷ Income",
              data: months.map((m) => m.netWorthGrowth),
              borderColor: NET_WORTH_COLOR,
              backgroundColor: NET_WORTH_COLOR,
              borderWidth: 2,
              tension: 0.3,
              pointRadius: months.length > 24 ? 0 : 3,
              pointHoverRadius: 5,
              spanGaps: true,
              yAxisID: "y1",
              order: 0,
            },
          ]
        : []),
    ],
  };

  const percentTicks = {
    color: "rgba(255,255,255,0.7)",
    maxTicksLimit: isMobile ? 5 : 7,
    callback: (value) => `${value}%`,
    font: { size: isMobile ? 10 : 12 },
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "white", boxWidth: 12, padding: isMobile ? 10 : 16, font: { size: isMobile ? 11 : 12 } },
      },
      tooltip: {
        callbacks: {
          label: (item) => {
            const m = months[item.dataIndex];
            if (item.dataset.yAxisID === "y") {
              return [
                `Saved: ${formatCurrency(m.saved)} of ${formatCurrency(m.income)} income`,
                `Savings Rate: ${formatPercent(m.savingsRate)}`,
              ];
            }
            return `Net Worth Growth: ${formatPercent(m.netWorthGrowth)} (${formatCurrency(m.netWorthChange)})`;
          },
          footer: (items) => (items.length && months[items[0].dataIndex].inProgress ? "Month in progress" : ""),
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "rgba(255,255,255,0.7)",
          maxRotation: 0,
          autoSkip: true,
          autoSkipPadding: 16,
          maxTicksLimit: isMobile ? 6 : 12,
          font: { size: isMobile ? 10 : 12 },
        },
      },
      y: {
        position: "left",
        grid: { color: "rgba(255,255,255,0.08)" },
        ticks: percentTicks,
        title: { display: !isMobile, text: "Savings Rate", color: "rgba(255,255,255,0.7)" },
      },
      // Separate axis: one big market month would otherwise flatten the bars
      y1: {
        display: hasNetWorthGrowth,
        position: "right",
        grid: { drawOnChartArea: false },
        ticks: { ...percentTicks, color: NET_WORTH_COLOR },
        title: { display: !isMobile, text: "Net Worth Growth", color: NET_WORTH_COLOR },
      },
    },
  };

  return (
    <Paper sx={{ ...panelSx, height: "100%", boxSizing: "border-box" }}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h6">Savings Rate</Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={range}
          onChange={(e, value) => value && setRange(value)}
          sx={toggleSx}
        >
          {RANGES.map((r) => (
            <ToggleButton key={r.id} value={r.id}>
              {r.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={4}>
          <Stat
            label={`Avg Rate (${complete.length} mo)`}
            value={formatPercent(avgRate)}
            color={avgRate !== null ? changeColor(avgRate) : undefined}
            info="Total saved ÷ total income across the finished months in this range. Saved = income − fixed − varied expenses, from your Budget. The current month is left out until it ends."
          />
        </Grid>
        <Grid item xs={4}>
          <Stat
            label={lastMonth ? `${lastMonth.label} Rate` : "Last Month Rate"}
            value={formatPercent(lastMonth ? lastMonth.savingsRate : null)}
            color={lastMonth && lastMonth.savingsRate !== null ? changeColor(lastMonth.savingsRate) : undefined}
            info="Share of income kept in the most recent finished month: (income − fixed − varied expenses) ÷ income."
          />
        </Grid>
        <Grid item xs={4}>
          <Stat
            large
            label={lastMonth ? `Saved in ${lastMonth.label}` : "Saved Last Month"}
            value={lastMonth ? money(lastMonth.saved) : "—"}
            color={lastMonth ? changeColor(lastMonth.saved) : undefined}
            sub={avgSaved !== null ? `avg ${money(avgSaved)}/mo` : undefined}
          />
        </Grid>
      </Grid>

      <Box sx={{ position: "relative", height: { xs: 260, sm: 340, md: 380 } }}>
        {!months.some((m) => m.income > 0) ? (
          <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", px: 2 }}>
            <Typography variant="body2" sx={{ color: mutedText }}>
              No budget income recorded in this range.
            </Typography>
          </Box>
        ) : (
          <Bar data={data} options={options} />
        )}
      </Box>
    </Paper>
  );
}
