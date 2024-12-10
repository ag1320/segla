import { useContext } from "react";
import { AppContext } from "../../AppContext";
import { Bar } from "react-chartjs-2";
import "./ReportModal.css";
import { Modal, Box, Grid, Typography, Button } from "@mui/material";
import ReportStats from "./ReportStats";

export default function ReportModal({ open, setOpen }) {
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    maxWidth: 1000,
    maxHeight: "80vh",
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    textAlign: "center",
    overflowY: "auto",
  };

  let { reportData, setReportData } = useContext(AppContext);
  let { reportStartDate, setReportStartDate } = useContext(AppContext);
  let { reportEndDate, setReportEndDate } = useContext(AppContext);
  let reportStartDateString = "";
  let reportEndDateString = "";

  const handleModalClose = () => {
    setReportStartDate(null);
    setReportEndDate(null);
    setReportData([]);
    sortedReportData = [];
    setOpen(false);
  };

  const generateLabels = (reportStartDate, reportEndDate) => {
    let labels = [];
    let currentDate = new Date(reportStartDate);

    while (currentDate <= reportEndDate) {
      labels.push([
        currentDate.toLocaleString("en-US", { month: "long" }),
        currentDate.getFullYear().toString(),
      ]);
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return labels;
  };

  const options = {
    maintainAspectRatio: true,
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        align: "start",
        labels: {
          usePointStyle: true,
          color: "#000",
        },
      },
    },
  };

  let labels = generateLabels(reportStartDate, reportEndDate);

  //sum the transactions by category by month and year
  function simplifyData(data) {
    let simplifiedData = [];
    data.forEach((transaction) => {
      let entry = simplifiedData.find(
        (item) =>
          item.category === transaction.category &&
          item.subcategory === transaction.subcategory
      );
      if (entry) {
        let monthIndex = entry.sumOfTransactionsByMonth.findIndex(
          (item) =>
            item.month === transaction.month && item.year === transaction.year
        );
        if (monthIndex !== -1) {
          entry.sumOfTransactionsByMonth[monthIndex].amount +=
            transaction.amount;
        } else {
          entry.sumOfTransactionsByMonth.push({
            month: transaction.month,
            year: transaction.year,
            amount: transaction.amount,
          });
        }
      } else {
        simplifiedData.push({
          category: transaction.category,
          subcategory: transaction.subcategory,
          sumOfTransactionsByMonth: [
            {
              month: transaction.month,
              year: transaction.year,
              amount: transaction.amount,
            },
          ],
        });
      }
    });

    return simplifiedData;
  }

  function sortByMonthAndYear(array) {
    const monthsMap = {
      January: 1,
      February: 2,
      March: 3,
      April: 4,
      May: 5,
      June: 6,
      July: 7,
      August: 8,
      September: 9,
      October: 10,
      November: 11,
      December: 12,
    };

    array.sort(function (a, b) {
      var monthA = monthsMap[a.month];
      var monthB = monthsMap[b.month];

      if (a.year !== b.year) {
        return a.year - b.year;
      } else {
        return monthA - monthB;
      }
    });

    return array;
  }

  let sortedReportData = sortByMonthAndYear(reportData);
  let simplifiedData = simplifyData(sortedReportData);
  simplifiedData.forEach((entry) => {
    let sortedSumOfTransactionByMonth = sortByMonthAndYear(
      entry.sumOfTransactionsByMonth
    );
    entry.sumOfTransactionsByMonth = sortedSumOfTransactionByMonth;
  });

  //insert 0s into months that dont have any spending in that category
  let obj = {};
  let month = "";
  let year = 0;
  for (let i = 0; i < labels.length; i++) {
    month = labels[i][0];
    year = labels[i][1];

    simplifiedData.forEach((entry) => {
      if (
        entry.sumOfTransactionsByMonth[i]?.month !== month &&
        entry.sumOfTransactionsByMonth[i]?.year !== year
      ) {
        obj = { month, year, amount: 0 };
        entry.sumOfTransactionsByMonth.splice(i, 0, obj);
      }
    });
  }

  function getRandomRGB() {
    let randomNum1 = Math.floor(Math.random() * 156) + 100;
    let randomNum2 = Math.floor(Math.random() * 156) + 100;
    let randomNum3 = Math.floor(Math.random() * 156) + 100;

    if (randomNum1 > 220 && randomNum2 > 220 && randomNum3 > 220) {
      let min = Math.min(randomNum1, randomNum2, randomNum3);
      let diff = min - 220;
      randomNum1 -= diff;
      randomNum2 -= diff;
      randomNum3 -= diff;
    }

    return [randomNum1, randomNum2, randomNum3];
  }

  let datasets = [];
  let colors = [];
  let colorString = "";
  let categoryData = [];
  simplifiedData.forEach((entry) => {
    let datasetObj = { borderWidth: 1 };
    colors = getRandomRGB();
    colorString =
      "rgba(" + colors[0] + ", " + colors[1] + ", " + colors[2] + ", ";
    categoryData = entry.sumOfTransactionsByMonth.map((monthlySum) => {
      return monthlySum.amount;
    });

    entry.category === "Utilities"
      ? (datasetObj.label = entry.subcategory)
      : (datasetObj.label = entry.category);
    datasetObj.backgroundColor = colorString + "0.5)";
    datasetObj.borderColor = colorString + "1.0)";
    datasetObj.data = categoryData;
    datasets.push(datasetObj);
  });

  let data = { labels, datasets };
  let categoriesString = datasets.map((item) => item.label).join(", ");

  if (reportStartDate) {
    reportStartDateString = reportStartDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }
  if (reportEndDate) {
    reportEndDateString = reportEndDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }

  return (
    <Modal
      open={open}
      onClose={handleModalClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box className="monthly-expense-text">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography
                    component={"span"}
                    id="modal-modal-title"
                    variant="h5"
                  >
                    {`Report for: ${categoriesString}`}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    component={"span"}
                    id="modal-modal-title"
                    variant="h5"
                  >
                    {`From ${reportStartDateString} to ${reportEndDateString}`}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
          <Grid item xs={12}>
            {data && data.datasets && data.datasets.length > 0 ? (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box className="chart-container">
                    <Bar data={data} options={options} className="chart" />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box className="report-table-container">
                    <ReportStats data={data} />
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <></>
            )}
          </Grid>
          <Grid item xs={12}>
            <Grid container justifyContent="end" spacing={2}>
              <Grid item xs={3}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleModalClose}
                  sx={{ backgroundColor: "#0f4c75" }}
                >
                  OK
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
}
