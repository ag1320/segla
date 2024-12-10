import { AppContext } from "../../AppContext";
import { useContext } from "react";
import "./MonthlyFixedExpenses.css";
import { formatMonthlyFixedExpense } from "./FixedExpensesFuncs";
import {
  Grid,
  Typography,
  Table,
  TableHead,
  TableContainer,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";

export default function MonthlyIncome() {
  let { date } = useContext(AppContext);
  let { monthlyFixedExpenses } = useContext(AppContext);
  let { totalMonthlyFixedExpenses } = useContext(AppContext);
  let formattedExpenses = formatMonthlyFixedExpense(monthlyFixedExpenses);
  let aaronTotal = formattedExpenses.reduce((prevAmount, currentAaron) => {
    return prevAmount + currentAaron.aaron;
  }, 0);
  let jenTotal = formattedExpenses.reduce((prevAmount, currentJen) => {
    return prevAmount + currentJen.jen;
  }, 0);

  formattedExpenses.sort((a,b)=>{
    let textA = a.category.toLowerCase()
    let textB = b.category.toLowerCase()
    return (textA < textB ) ? -1: (textA> textB) ? 1: 0;
  })

  formattedExpenses.push({
    category: "Total",
    aaron: aaronTotal,
    jen: jenTotal,
    subtotal: totalMonthlyFixedExpenses,
  });

  let borders = formattedExpenses.map((expense, index) => {
    let border = "";
    if (index === formattedExpenses.length - 2) {
      border = "solid #000 2px";
    } else if (index === formattedExpenses.length - 1) {
      border = "none";
    } else {
      border = "solid #777 1px";
    }
    return border;
  });

  return (
    <>
      {date ? (
        <>
          <Grid container>
            <Grid item xs={12}>
              <Typography component = {'span'} className="fixed-expenses-total" variant="h6">
                Total Fixed Expenses: $ {totalMonthlyFixedExpenses}
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <TableContainer
              component={Paper}
              sx={{ maxWidth: "600px", margin: "auto", padding: "30px" }}
            >
              <Table aria-label="a dense table" size="small">
                <TableHead>
                  <TableRow>
                    <TableCell
                      width="20%"
                      style={{ borderBottom: "solid #777 1px" }}
                    >
                      Category
                    </TableCell>
                    <TableCell
                      align="right"
                      style={{ borderBottom: "solid #777 1px" }}
                    >
                      Aaron
                    </TableCell>
                    <TableCell
                      align="right"
                      style={{ borderBottom: "solid #777 1px" }}
                    >
                      Jen
                    </TableCell>
                    <TableCell
                      align="right"
                      style={{ borderBottom: "solid #777 1px" }}
                    >
                      Subtotal
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formattedExpenses.map((expense, index) => (
                    <TableRow
                      key={expense.category}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    >
                      <TableCell
                        component="th"
                        scope="row"
                        style={{ borderBottom: borders[index] }}
                      >
                        {expense.category}
                      </TableCell>
                      <TableCell
                        align="right"
                        style={{ borderBottom: borders[index] }}
                      >{`${
                        (expense.aaron === 0  || expense.aaron === null)? "-" : `$ ${expense.aaron.toFixed(2)}`
                      }`}</TableCell>
                      <TableCell
                        align="right"
                        style={{ borderBottom: borders[index] }}
                      >{`${
                        (expense.jen === 0 || expense.jen === null)? "-" : `$ ${expense.jen.toFixed(2)}`
                      }`}</TableCell>
                      <TableCell
                        align="right"
                        style={{ borderBottom: borders[index] }}
                      >{`${
                        (expense.subtotal === 0 ||expense.subtotal === null) ? "-" : `$ ${expense.subtotal.toFixed(2)}`
                      }`}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </>
      ) : (
        <Typography component = {'span'} style = {{color: '#FFF'}}>Please Select a Budget Month</Typography>
      )}
    </>
  );
}
