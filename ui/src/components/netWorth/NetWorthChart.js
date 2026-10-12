import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import {
  Box,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { chartColors } from "../colors.js";
import { formatCompact, formatCurrency, parseDate } from "./netWorthFormat";
import { ASSET_CATEGORIES } from "./netWorthCategories";
import { panelSx, toggleSx } from "./netWorthStyles";
Chart.register(...registerables);

const DAY_MS = 24 * 60 * 60 * 1000;

const RANGES = [
  { id: "3M", label: "3M" },
  { id: "6M", label: "6M" },
  { id: "YTD", label: "YTD" },
  { id: "1Y", label: "1Y" },
  { id: "ALL", label: "All" },
];

const rangeStart = (range) => {
  const now = new Date();
  switch (range) {
    case "3M":
      return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    case "6M":
      return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    case "YTD":
      return new Date(now.getFullYear(), 0, 1);
    case "1Y":
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    default:
      return null;
  }
};

const NET_WORTH_RGB = "0, 188, 212"; // Net Worth card accent on Home
const ASSETS_COLOR = "#3282b8";
const LIABILITIES_COLOR = "#f95d6a";

const hexToRgba = (hex, alpha) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

// Vertical fade under the net worth line
const netWorthGradient = (context) => {
  const { ctx, chartArea } = context.chart;
  if (!chartArea) return `rgba(${NET_WORTH_RGB}, 0.2)`;
  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  gradient.addColorStop(0, `rgba(${NET_WORTH_RGB}, 0.45)`);
  gradient.addColorStop(1, `rgba(${NET_WORTH_RGB}, 0)`);
  return gradient;
};

export default function NetWorthChart() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const snapshots = useSelector((state) => state.netWorth.snapshots);
  const [view, setView] = useState("netWorth");
  const [range, setRange] = useState("ALL");

  const visible = useMemo(() => {
    const start = rangeStart(range);
    return start ? snapshots.filter((s) => parseDate(s.date) >= start) : snapshots;
  }, [snapshots, range]);

  const points = (key) => visible.map((s) => ({ x: parseDate(s.date).getTime(), y: s[key] }));

  const data =
    view === "netWorth"
      ? {
          datasets: [
            {
              label: "Net Worth",
              data: points("netWorth"),
              borderColor: `rgb(${NET_WORTH_RGB})`,
              backgroundColor: netWorthGradient,
              fill: true,
              borderWidth: 3,
              tension: 0.3,
              pointRadius: visible.length > 60 ? 0 : 3,
              pointHoverRadius: 6,
              order: 0,
            },
            {
              label: "Assets",
              data: points("totalAssets"),
              borderColor: ASSETS_COLOR,
              backgroundColor: ASSETS_COLOR,
              borderWidth: 2,
              borderDash: [6, 4],
              tension: 0.3,
              pointRadius: 0,
              pointHoverRadius: 5,
              fill: false,
              order: 1,
            },
            {
              label: "Liabilities",
              data: points("totalLiabilities"),
              borderColor: LIABILITIES_COLOR,
              backgroundColor: LIABILITIES_COLOR,
              borderWidth: 2,
              borderDash: [6, 4],
              tension: 0.3,
              pointRadius: 0,
              pointHoverRadius: 5,
              fill: false,
              order: 2,
            },
          ],
        }
      : {
          datasets: ASSET_CATEGORIES.map((series, i) => ({
            label: series.label,
            data: points(series.key),
            borderColor: chartColors[i],
            backgroundColor: hexToRgba(chartColors[i], 0.55),
            fill: i === 0 ? "origin" : "-1",
            borderWidth: 1.5,
            tension: 0.3,
            pointRadius: 0,
            pointHoverRadius: 4,
          })),
        };

  // A single snapshot gives the x-axis a zero-width range - pad it so the
  // lone point sits in the middle instead of on a squashed axis.
  const xs = visible.map((s) => parseDate(s.date).getTime());
  const xMin = xs.length ? Math.min(...xs) : undefined;
  const xMax = xs.length ? Math.max(...xs) : undefined;
  const singlePoint = xs.length > 0 && xMin === xMax;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "white",
          boxWidth: 12,
          padding: isMobile ? 10 : 16,
          font: { size: isMobile ? 11 : 12 },
        },
      },
      tooltip: {
        callbacks: {
          title: (items) =>
            items.length
              ? new Date(items[0].parsed.x).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "",
          label: (item) => `${item.dataset.label}: ${formatCurrency(item.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        type: "linear",
        min: singlePoint ? xMin - 15 * DAY_MS : xMin,
        max: singlePoint ? xMax + 15 * DAY_MS : xMax,
        grid: { color: "rgba(255,255,255,0.06)" },
        ticks: {
          color: "rgba(255,255,255,0.7)",
          maxTicksLimit: isMobile ? 4 : 8,
          maxRotation: 0,
          callback: (value) =>
            new Date(value).toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        },
      },
      y: {
        stacked: view === "breakdown",
        grid: { color: "rgba(255,255,255,0.08)" },
        ticks: {
          color: "rgba(255,255,255,0.7)",
          maxTicksLimit: isMobile ? 5 : 8,
          callback: (value) => formatCompact(value),
        },
      },
    },
  };

  return (
    <Paper sx={panelSx}>
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
        <ToggleButtonGroup
          exclusive
          size="small"
          value={view}
          onChange={(e, value) => value && setView(value)}
          sx={toggleSx}
        >
          <ToggleButton value="netWorth">Net Worth</ToggleButton>
          <ToggleButton value="breakdown">Asset Mix</ToggleButton>
        </ToggleButtonGroup>
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

      <Box sx={{ position: "relative", height: { xs: 300, sm: 380, md: 440 } }}>
        {visible.length === 0 ? (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              px: 2,
            }}
          >
            <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.6)" }}>
              {snapshots.length === 0
                ? "No history yet. A snapshot is saved automatically whenever you update an account, or tap Capture Now."
                : "No snapshots in this range yet."}
            </Typography>
          </Box>
        ) : (
          <Line data={data} options={options} />
        )}
      </Box>
    </Paper>
  );
}
