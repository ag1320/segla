import { useContext, useEffect } from "react";
import { AppContext } from "../../AppContext";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import "./GenerateReportModal.css";
import axios from "axios";
import {
  Modal,
  Box,
  Grid,
  TextField,
  Typography,
  Button,
  Chip,
} from "@mui/material";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DatePicker from "@mui/lab/DatePicker";

export default function GenerateReportModal({ open, setOpen, setViewReport }) {
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    textAlign: "center",
  };

  const theme = createTheme({
    components: {
      MuiIconButton: {
        styleOverrides: {
          sizeMedium: {
            color: "#0f4c75",
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            color: "#000000",
            border: "solid 1px #000000",
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: "#000000",
          },
        },
      },
    },
  });

  let { currentBudgetCategories } = useContext(AppContext);
  let { setReportData } = useContext(AppContext);
  let { setReportTotalData } = useContext(AppContext);
  let { reportStartDate, setReportStartDate } = useContext(AppContext);
  let { reportEndDate, setReportEndDate } = useContext(AppContext);
  let { setSnackbarError } = useContext(AppContext);
  let { reportSelectedCategories, setReportSelectedCategories } =
    useContext(AppContext);
  let { reportSelectedTypeCategories, setReportSelectedTypeCategories } =
    useContext(AppContext);

  const typeCategories = [
    "Varied Expenses",
    "Fixed Expenses",
    "Income",
    "Month End Distributions",
    "Total Fixed and Varied Expenses",
  ];

  const handleChipClick = (category) => {
    if (reportSelectedCategories.includes(category)) {
      setReportSelectedCategories(
        reportSelectedCategories.filter((item) => item !== category)
      );
    } else {
      setReportSelectedCategories([...reportSelectedCategories, category]);
    }
  };

  const handleTypeChipClick = (type) => {
    if (reportSelectedTypeCategories.includes(type)) {
      setReportSelectedTypeCategories(
        reportSelectedTypeCategories.filter((item) => item !== type)
      );
    } else {
      setReportSelectedTypeCategories([...reportSelectedTypeCategories, type]);
    }
  };

  const handleDateStartChange = (newDate) => {
    setReportStartDate(newDate);
  };

  const handleDateEndChange = (newDate) => {
    setReportEndDate(newDate);
  };

  const handleModalClose = (event, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      setReportStartDate(null);
      setReportEndDate(null);
      setReportSelectedCategories([]);
    }
    setOpen(false);
  };

  const formatSelectedCategories = () => {
    const formattedCategories = [];

    for (const selectedCategory of reportSelectedCategories) {
      const selectedCategoryLowerCase = selectedCategory.toLowerCase();

      // Check if the category is a subcategory of "Utilities" by searching the budgetCategories array
      const foundCategory = currentBudgetCategories.find((budgetCategory) =>
        budgetCategory.subcategory
          ? budgetCategory.subcategory.toLowerCase() ===
            selectedCategoryLowerCase
          : false
      );

      // If the category is found in budgetCategories, it's a subcategory of "Utilities"
      if (foundCategory) {
        formattedCategories.push({
          category: "Utilities",
          subcategory: foundCategory.subcategory,
        });
      } else {
        // If not found in budgetCategories, it's a top-level category
        if (selectedCategory !== "Utilities") {
          formattedCategories.push({
            category: selectedCategory,
            subcategory: null,
          });
        }
      }
    }

    return formattedCategories;
  };

  const handleSubmit = () => {
    if (
      reportStartDate === null ||
      reportEndDate === null ||
      reportEndDate < reportStartDate ||
      (reportSelectedCategories.length === 0 &&
        reportSelectedTypeCategories.length === 0)
    ) {
      setSnackbarError(true);
      return;
    }

    let formattedCategories = formatSelectedCategories();
    const startDateString = reportStartDate.toISOString().slice(0, 7) + "-01";
    const endDateString = reportEndDate.toISOString().slice(0, 7) + "-01";

    async function getReportData() {
      let payload = {
        startDateString,
        endDateString,
        formattedCategories,
        reason: "categories",
      };
      let res = await axios.get(`http://localhost:3001/reportData`, {
        params: payload,
      });
      return res.data;
    }
    async function getTotalData() {
      let payload = {
        startDateString,
        endDateString,
        formattedCategories: [],
        reason: "total",
      };
      let res = await axios.get(`http://localhost:3001/reportData`, {
        params: payload,
      });
      return res.data;
    }

    if (reportSelectedTypeCategories.length > 0) {
      getTotalData().then((items) => {
        console.log("items", items);
        setReportTotalData(items);
      });
    } else {
      setReportTotalData([]);
    }
    getReportData().then((items) => {
      setReportData(items);
    });
    setViewReport(true);
    handleModalClose(null, null);
  };

  useEffect(() => {
    // // Add categories to currentBudgetCategories if they don't exist
    // const variedExpensesCategory = {
    //   budget_categories_id: "varied-unique-id",
    //   category: "Varied Expenses",
    //   subcategory: null,
    // };
    // if (
    //   !currentBudgetCategories.some((cat) => cat.category === "Varied Expenses")
    // ) {
    //   setCurrentBudgetCategories((prevCategories) => [
    //     ...prevCategories,
    //     variedExpensesCategory,
    //   ]);
    // }
    // const fixedExpensesCategory = {
    //   budget_categories_id: "fixed-unique-id",
    //   category: "Fixed Expenses",
    //   subcategory: null,
    // };
    // if (
    //   !currentBudgetCategories.some((cat) => cat.category === "Fixed Expenses")
    // ) {
    //   setCurrentBudgetCategories((prevCategories) => [
    //     ...prevCategories,
    //     fixedExpensesCategory,
    //   ]);
    // }
    // const incomeCategory = {
    //   budget_categories_id: "income-unique-id",
    //   category: "Income",
    //   subcategory: null,
    // };
    // if (!currentBudgetCategories.some((cat) => cat.category === "Income")) {
    //   setCurrentBudgetCategories((prevCategories) => [
    //     ...prevCategories,
    //     incomeCategory,
    //   ]);
    // }
    // const monthEndDistributionsCategory = {
    //   budget_categories_id: "med-unique-id",
    //   category: "Month End Distributions",
    //   subcategory: null,
    // };
    // if (
    //   !currentBudgetCategories.some(
    //     (cat) => cat.category === "Month End Distributions"
    //   )
    // ) {
    //   setCurrentBudgetCategories((prevCategories) => [
    //     ...prevCategories,
    //     monthEndDistributionsCategory,
    //   ]);
    // }
    // const totalFixedAndVariedCategory = {
    //   budget_categories_id: "varied-and-fixed-unique-id",
    //   category: "Total Fixed and Varied Expenses",
    //   subcategory: null,
    // };
    // if (
    //   !currentBudgetCategories.some(
    //     (cat) => cat.category === "Total Fixed and Varied Expenses"
    //   )
    // ) {
    //   setCurrentBudgetCategories((prevCategories) => [
    //     ...prevCategories,
    //     totalFixedAndVariedCategory,
    //   ]);
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBudgetCategories]);

  return (
    <Modal
      open={open}
      onClose={handleModalClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Box className="monthly-expense-text">
          <Typography component={"span"} id="modal-modal-title" variant="h5">
            Generate a Budget Report
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box className="monthly-expense-text">
              <Typography
                component={"span"}
                id="modal-modal-title"
                variant="h6"
              >
                Select Date Range
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={5}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                views={["year", "month"]}
                minDate={new Date("2022-04-01")}
                value={reportStartDate}
                onChange={handleDateStartChange}
                label="Select Start Month"
                renderInput={(params) => {
                  return (
                    <ThemeProvider theme={theme}>
                      <TextField {...params} />
                    </ThemeProvider>
                  );
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={5}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                views={["year", "month"]}
                minDate={new Date("2022-01-01")}
                value={reportEndDate}
                onChange={handleDateEndChange}
                label="Select End Month"
                renderInput={(params) => {
                  return (
                    <ThemeProvider theme={theme}>
                      <TextField {...params} />
                    </ThemeProvider>
                  );
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12}>
            <Box className="monthly-expense-text">
              <Typography
                component={"span"}
                id="modal-modal-title"
                variant="h6"
              >
                Select Budget Categories for the Report
              </Typography>
            </Box>
          </Grid>
        </Grid>
        <Grid container rowSpacing={4} columnSpacing={2}>

          <Grid item xs={12} className="type-categories">
            <Grid container spacing={2} justifyContent="start">
              {typeCategories.map((type) => (
                <Grid item>
                  <Chip
                    label={type}
                    onClick={() => handleTypeChipClick(type)}
                    color={
                      reportSelectedTypeCategories.includes(type)
                        ? "primary"
                        : "default"
                    }
                    variant="outlined"
                    clickable
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid item xs={12} className="categories">
            <Grid container spacing={2} justifyContent="start">
              {currentBudgetCategories.map((categoryObj) =>
                // Check if the category is 'Utilities' and if it has a subcategory
                categoryObj.category === "Utilities" &&
                categoryObj.subcategory ? null : ( // If it's a subcategory, skip rendering here
                  // Render chips for all other categories (including 'Utilities' without subcategories)
                  <Grid item key={categoryObj.budget_categories_id}>
                    <Chip
                      label={categoryObj.category}
                      onClick={() => handleChipClick(categoryObj.category)}
                      color={
                        reportSelectedCategories.includes(categoryObj.category)
                          ? "primary"
                          : "default"
                      }
                      variant="outlined"
                      clickable
                    />
                  </Grid>
                )
              )}
              {/* Render a single chip for 'Utilities' category that has subcategories */}
              {currentBudgetCategories.find(
                (categoryObj) =>
                  categoryObj.category === "Utilities" &&
                  categoryObj.subcategory
              ) && (
                <Grid item>
                  <Chip
                    label="Utilities"
                    onClick={() => handleChipClick("Utilities")}
                    color={
                      reportSelectedCategories.includes("Utilities")
                        ? "primary"
                        : "default"
                    }
                    variant="outlined"
                    clickable
                  />
                </Grid>
              )}
              {/* Render chips for subcategories of 'Utilities' category when 'Utilities' chip is clicked */}
              {reportSelectedCategories.includes("Utilities") &&
                currentBudgetCategories
                  .filter(
                    (categoryObj) =>
                      categoryObj.category === "Utilities" &&
                      categoryObj.subcategory
                  )
                  .map((subcategoryObj) => (
                    <Grid item key={subcategoryObj.budget_categories_id}>
                      <Chip
                        label={subcategoryObj.subcategory}
                        onClick={() =>
                          handleChipClick(subcategoryObj.subcategory)
                        }
                        color={
                          reportSelectedCategories.includes(
                            subcategoryObj.subcategory
                          )
                            ? "primary"
                            : "default"
                        }
                        variant="outlined"
                        clickable
                      />
                    </Grid>
                  ))}
            </Grid>
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
                  Cancel
                </Button>
              </Grid>
              <Grid item xs={3}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSubmit}
                  sx={{ backgroundColor: "#0f4c75" }}
                >
                  Submit
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
}
