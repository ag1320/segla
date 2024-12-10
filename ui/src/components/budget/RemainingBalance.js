import { Card, Stack, Divider, TextField, CardContent } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useState, useContext } from "react";
import { AppContext } from "../../AppContext.js";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DatePicker from "@mui/lab/DatePicker";
import { checkBudget } from "./BudgetFunctions.js";
import NewBudgetDialog from "./NewBudgetDialog.js";

export default function RemainingBalance() {
  let { setBudgetData } = useContext(AppContext);
  let { setNewBudget } = useContext(AppContext);
  let { remainingBalance } = useContext(AppContext);
  let { date, setDate } = useContext(AppContext);
  let { setReason } = useContext(AppContext);
  const [isEmpty, setIsEmpty] = useState(false);
  const handleDateChange = (event) => {
    setReason("Budget");
    setDate(event);
  };
  const handleBlur = () => {
    let month = date.toLocaleString("EN-US", { month: "long" });
    let year = date.getFullYear();
    checkBudget(month, year).then((data) => {
      setBudgetData(data);
      if (Object.keys(data).length) {
        setIsEmpty(false);
      } else {
        setIsEmpty(true);
      }
    });
  };
  const handleConfirm = () => {
    setNewBudget(true);
  };
  const theme = createTheme({
    components: {
      MuiIconButton: {
        styleOverrides: {
          sizeMedium: {
            color: "#ffffff",
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            color: "#ffffff",
            border: "solid 1px #ffffff",
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: "#ffffff",
          },
        },
      },
    },
  });

  return (
    <>
      <NewBudgetDialog
        open={isEmpty}
        setOpen={setIsEmpty}
        month={date?.toLocaleString("EN-US", { month: "long" })}
        year={date?.getFullYear()}
        onConfirm={handleConfirm}
      />
      <Card
        variant="outlined"
        style={{
          width: "90%",
          margin: "auto",
          backgroundColor: "#1b262c",
          color: "white",
          boxShadow: "1px 1px 2px 2px #151515",
        }}
      >
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-evenly"
            spacing={6}
            alignItems="center"
          >
            <Stack>
              <p>Month</p>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  views={["year", "month"]}
                  minDate={new Date("2022-01-01")}
                  value={date}
                  onChange={handleDateChange}
                  onBlur={handleBlur}
                  label="Select a Month"
                  renderInput={(params) => {
                    return (
                      <ThemeProvider theme={theme}>
                        <TextField {...params} />
                      </ThemeProvider>
                    );
                  }}
                />
              </LocalizationProvider>
            </Stack>
            <Stack>
              <p>Remaining Balance</p>
              <Divider color="#ffffff" style={{ width: "90%" }} />
              <p>$ {remainingBalance}</p>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}
