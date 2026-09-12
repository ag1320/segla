import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import ClearIcon from "@mui/icons-material/Clear";
import './MonthlyIncome.css'
import AddIncomeModal from './AddIncomeModal'
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import { removeMonthlyIncome } from "../../state/monthlyIncomeSlice";
import { setSnackbarSuccess, setSnackbarError } from "../../state/uiSlice";
import { selectBudgetBalance } from "../../utilities/helperFunctions";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
  CardHeader,
  IconButton,
  Button,
} from "@mui/material";

export default function MonthlyIncome() {
  const dispatch = useDispatch();
  const monthlyIncome = useSelector((state) => state.monthlyIncome.items);
  const date = useSelector((state) => state.budget.date);
  const { totalIncome } = useSelector(selectBudgetBalance);
  let [openAddIncome, setOpenAddIncome] = useState(false);

  const handleDeleteMonthlyIncome = (id) => {
    let month = date?.toLocaleString("EN-US", { month: "long" });
    let year = date?.getFullYear();
    dispatch(removeMonthlyIncome({ id, month, year }))
      .unwrap()
      .then(() => dispatch(setSnackbarSuccess(true)))
      .catch(() => dispatch(setSnackbarError(true)));
  };

  const handleAddIncome = () => setOpenAddIncome(true);

  // useSelector returns the Redux state array by reference, which Immer
  // freezes in development - sorting it in place throws "Cannot assign to
  // read only property". Sort a copy instead.
  const sortedMonthlyIncome = [...monthlyIncome].sort((a,b)=>{
    let textA = a.category.toLowerCase()
    let textB = b.category.toLowerCase()
    return (textA < textB ) ? -1: (textA> textB) ? 1: 0;
  })

  return (
    <>
      {date ? (
        <>
          <AddIncomeModal
            open={openAddIncome}
            setOpen={setOpenAddIncome}
          />
          <Grid container>
            <Grid item xs={12} sm={4} md={3}>
              <Button
                onClick={handleAddIncome}
                className="add-income-button"
              >
                <AddCircleOutline className="add-income-icon" />
                <Typography component = {'span'}>Add Income Source</Typography>
              </Button>
            </Grid>
            <Grid item xs={12} sm={8} md={9}>
              <Typography component = {'span'} className = 'income-total' variant = 'h6'>
                Total Income: $ {totalIncome}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Grid container justifyContent="center" spacing={4}>
                {sortedMonthlyIncome.map((income, id) => {
                  return (
                    <Grid item xs={6} sm={4} md={3} key = {id}>
                      <Card style={{ marginTop: "50px" }}>
                        <CardHeader
                          title={income.category}
                          action={
                            <IconButton
                              onClick={() =>
                                handleDeleteMonthlyIncome(
                                  income.monthly_expenses_id
                                )
                              }
                            >
                              <ClearIcon />
                            </IconButton>
                          }
                        ></CardHeader>
                        <Divider variant="middle" />
                        <CardContent>
                          <Grid container justifyContent="center">
                            <Grid item xs={12}>
                              <Typography component = {'span'} variant="h6" align="center">
                                $ {income.amount.toFixed(2)}
                              </Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>
          </Grid>
        </>
      ) : (
        <Typography component = {'span'}>
         Please Select a Budget Month
        </Typography>
      )}
    </>
  );
}
