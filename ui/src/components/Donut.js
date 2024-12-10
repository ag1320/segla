import { Doughnut } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { chartColors } from "./colors.js";
import "./Donut.css";
Chart.register(...registerables);


const options = {
  responsive: true,
  layout: {
    padding: {
      top: 20,
      bottom: 20,
    },
  },
  aspectRatio: 1,
  elements: {
    arc: {
      borderWidth: 0,
    },
  },
};

export default function Donut({ composition, title }) {

  Chart.defaults.plugins.legend.display = true;
  Chart.defaults.plugins.legend.position = "left";
  Chart.defaults.plugins.legend.labels.color = "white";
  Chart.defaults.plugins.legend.align = "end";
  Chart.defaults.font.size = 16;
  Chart.defaults.plugins.title.display = true;
  Chart.defaults.plugins.title.text = title;
  Chart.defaults.plugins.title.color = "white";
  Chart.defaults.plugins.title.align = "end";

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
      <Doughnut data={data} options={options} width={300} height={250} />;
    </div>
  );
}
