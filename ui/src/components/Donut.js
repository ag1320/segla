import { Doughnut } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { chartColors } from "./colors.js";
import "./Donut.css";
Chart.register(...registerables);

// Draws title just above the actual arc outer edge (not the canvas top)
const centeredTitlePlugin = {
  id: "centeredTitle",
  afterDraw(chart, args, opts) {
    if (!opts.text) return;
    const meta = chart.getDatasetMeta(0);
    if (!meta.data.length) return;
    const { ctx, chartArea: { left, right } } = chart;
    const { outerRadius, y: centerY } = meta.data[0];
    ctx.save();
    ctx.font = "bold 14px sans-serif";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(opts.text, (left + right) / 2, centerY - outerRadius - 6);
    ctx.restore();
  },
};

// Draws the total amount in the center of the donut hole
const centerTotalPlugin = {
  id: "centerTotal",
  afterDraw(chart, args, opts) {
    if (opts.total == null || isNaN(opts.total)) return;
    const meta = chart.getDatasetMeta(0);
    if (!meta.data.length) return;
    const { ctx } = chart;
    const { x: centerX, y: centerY, innerRadius } = meta.data[0];
    const formatted = `$${Math.round(opts.total).toLocaleString()}`;
    const fontSize = Math.max(Math.min(innerRadius * 0.35, 16), 11);
    ctx.save();
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(formatted, centerX, centerY);
    ctx.restore();
  },
};

// Adds a horizontal gap between the legend box and the donut
const legendSpacingPlugin = {
  id: "legendSpacing",
  beforeInit(chart) {
    const originalFit = chart.legend.fit.bind(chart.legend);
    chart.legend.fit = function () {
      originalFit();
      this.width += 24;
    };
  },
};

export default function Donut({ composition, title }) {
  const total = Object.values(composition).reduce((sum, v) => sum + Number(v), 0);

  const options = {
    responsive: true,
    layout: {
      padding: 20,
    },
    aspectRatio: 1,
    elements: {
      arc: {
        borderWidth: 0,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "left",
        align: "center",
        labels: {
          color: "white",
          font: { size: 12 },
          boxWidth: 12,
          padding: 8,
        },
      },
      title: {
        display: false,
      },
      centeredTitle: {
        text: title,
      },
      centerTotal: {
        total,
      },
    },
  };

  let labels = Object.keys(composition);
  let dataComposition = Object.values(composition);
  const data = {
    labels,
    datasets: [
      {
        data: dataComposition,
        label: "composition",
        backgroundColor: chartColors,
        hoverBackgroundColor: chartColors,
        hoverBorderWidth: 1,
        hoverOffset: 20,
      },
    ],
  };

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <Doughnut
        data={data}
        options={options}
        plugins={[centeredTitlePlugin, centerTotalPlugin, legendSpacingPlugin]}
        width={300}
        height={250}
      />
    </div>
  );
}
