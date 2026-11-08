import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { Box, Paper } from "@mui/material";
import { formatCents, formatDate } from "../businessFormat";
import { panelSx } from "../../netWorth/netWorthStyles";

Chart.register(...registerables);

const LINE_COLOR = "#3282b8";

// valuations: oldest first. Spaced by date, so a gap of two years looks
// like two years.
export default function ValuationChart({ valuations }) {
  const toTime = (dateString) => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day).getTime();
  };
  const points = valuations.map((valuation) => ({
    x: toTime(valuation.valuationDate),
    y: valuation.valueCents / 100,
    date: valuation.valuationDate,
    cents: valuation.valueCents,
  }));

  const data = {
    datasets: [
      {
        label: "Market value",
        data: points,
        borderColor: LINE_COLOR,
        backgroundColor: LINE_COLOR,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items) => formatDate(items[0].raw.date),
          label: (item) => formatCents(item.raw.cents),
        },
      },
    },
    scales: {
      x: {
        type: "linear",
        grid: { color: "rgba(255,255,255,0.06)" },
        ticks: {
          color: "rgba(255,255,255,0.7)",
          maxTicksLimit: 6,
          maxRotation: 0,
          callback: (value) => new Date(value).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.08)" },
        ticks: {
          color: "rgba(255,255,255,0.7)",
          callback: (value) => `$${Math.round(value / 1000)}k`,
        },
      },
    },
  };

  return (
    <Paper sx={{ ...panelSx, mb: 2 }}>
      <Box sx={{ position: "relative", height: { xs: 240, sm: 300 } }}>
        <Line data={data} options={options} />
      </Box>
    </Paper>
  );
}
