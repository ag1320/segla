import { Box, TextField, Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DatePicker from "@mui/lab/DatePicker";
import { checkExistingBudget, setDate, setReason, setNewBudget } from "../../state/budgetSlice";
import NewBudgetDialog from "./NewBudgetDialog.js";

const pickerTheme = createTheme({
  components: {
    MuiIconButton: {
      styleOverrides: { sizeMedium: { color: "#ffffff" } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { color: "#ffffff", border: "solid 1px rgba(255,255,255,0.3)" },
      },
    },
    MuiInputLabel: {
      styleOverrides: { root: { color: "rgba(255,255,255,0.6)" } },
    },
  },
});

export default function RemainingBalance() {
  const dispatch = useDispatch();
  const date = useSelector((state) => state.budget.date);
  const [isEmpty, setIsEmpty] = useState(false);

  const handleDateChange = (event) => {
    dispatch(setReason("Budget"));
    dispatch(setDate(event));
  };

  const handleBlur = () => {
    let month = date.toLocaleString("EN-US", { month: "long" });
    let year = date.getFullYear();
    dispatch(checkExistingBudget({ month, year }))
      .unwrap()
      .then((data) => {
        setIsEmpty(!data.length);
      });
  };

  const handleConfirm = () => dispatch(setNewBudget(true));

  return (
    <>
      <NewBudgetDialog
        open={isEmpty}
        setOpen={setIsEmpty}
        month={date?.toLocaleString("EN-US", { month: "long" })}
        year={date?.getFullYear()}
        onConfirm={handleConfirm}
      />
      <Box>
        <Typography
          variant="caption"
          sx={{
            color: "rgba(255,255,255,0.45)",
            display: "block",
            mb: 1,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontSize: "0.65rem",
          }}
        >
          Budget Month
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            views={["year", "month"]}
            minDate={new Date("2022-01-01")}
            value={date}
            onChange={handleDateChange}
            onBlur={handleBlur}
            label="Select a Month"
            renderInput={(params) => (
              <ThemeProvider theme={pickerTheme}>
                <TextField {...params} size="small" />
              </ThemeProvider>
            )}
          />
        </LocalizationProvider>
      </Box>
    </>
  );
}
