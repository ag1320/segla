import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import "./ReportModal.css";
import {
  Modal,
  Box,
  Grid,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import ReportStats from "./ReportStats";
import EditIcon from "@mui/icons-material/Edit";
import { constructReportData } from "../../Calculations";
import {
  setReportStartDate,
  setReportEndDate,
  setReportSelectedCategories,
  setReportSelectedTypeCategories,
  clearReportData,
} from "../../state/reportsSlice";

ChartJS.register(...registerables);

export default function ReportModal({ open, setOpen, setOpenGenerateReport }) {
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

  const dispatch = useDispatch();
  const reportData = useSelector((state) => state.reports.data);
  const reportTotalData = useSelector((state) => state.reports.totalData);
  const reportWarningsAndLimitsData = useSelector((state) => state.reports.warningsAndLimitsData);
  const reportStartDate = useSelector((state) => state.reports.reportStartDate);
  const reportEndDate = useSelector((state) => state.reports.reportEndDate);
  const reportSelectedCategories = useSelector((state) => state.reports.reportSelectedCategories);
  const reportSelectedTypeCategories = useSelector((state) => state.reports.reportSelectedTypeCategories);

  let [data, setData] = useState({});

  let reportStartDateString = "";
  let reportEndDateString = "";
  let categoriesString = data?.datasets?.map((item) => item.label).join(", ");

  const handleModalClose = (event, reason) => {
    if (!(reason && reason === "editReportCriteria")) {
      dispatch(setReportStartDate(null));
      dispatch(setReportEndDate(null));
      dispatch(setReportSelectedCategories([]));
      dispatch(setReportSelectedTypeCategories([]));
    }
    setOpenGenerateReport(true);
    dispatch(clearReportData());
    setOpen(false);
  };

  const options = {
    maintainAspectRatio: true,
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "right",
        align: "start",
        labels: {
          usePointStyle: true,
          color: "#000",
        },
      },
    },
  };

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

  useEffect(() => {
    setData(
      constructReportData(
        reportStartDate,
        reportEndDate,
        reportData,
        reportTotalData,
        reportSelectedTypeCategories,
        reportWarningsAndLimitsData,
        reportSelectedCategories,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    reportStartDate,
    reportEndDate,
    reportData,
    reportTotalData,
    reportSelectedTypeCategories,
  ]);

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
                  <Box className="report-title-wrapper">
                    <IconButton
                      className="report-edit-button"
                      size="small"
                      onClick={() =>
                        handleModalClose(null, "editReportCriteria")
                      }
                    >
                      <EditIcon />
                    </IconButton>

                    <Typography
                      component="span"
                      id="modal-modal-title"
                      variant="h5"
                      className="report-title-text"
                    >
                      {`${categoriesString}`}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography
                    component={"span"}
                    id="modal-modal-title"
                    variant="h5"
                  >
                    {`from ${reportStartDateString} to ${reportEndDateString}`}
                  </Typography>
                </Grid>
                <Grid item xs={12} className="report-divider-container">
                  <div className="report-divider" />
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
                <Grid item xs={12} className="report-divider-container">
                  <div className="report-divider report-divider-2" />
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
              <Grid item xs="auto">
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => handleModalClose(null, "editReportCriteria")}
                  sx={{ backgroundColor: "#0f4c75" }}
                >
                  Edit Report Criteria
                </Button>
              </Grid>
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
