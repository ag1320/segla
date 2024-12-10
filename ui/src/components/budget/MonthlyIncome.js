import { AppContext } from "../../AppContext";
import { useContext, useState } from "react";
import ClearIcon from "@mui/icons-material/Clear";
import axios from "axios";
import './MonthlyIncome.css'
import AddIncomeModal from './AddIncomeModal'
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
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
  let { monthlyIncome } = useContext(AppContext);
  let { setSnackbarSuccess, setSnackbarError } = useContext(AppContext);
  let { date } = useContext(AppContext);
  let { setReason } = useContext(AppContext);
  let { budgetRefresh, setBudgetRefresh } = useContext(AppContext);
  let { totalIncome } = useContext(AppContext);
  let [openAddIncome, setOpenAddIncome] = useState(false);

  async function deleteMonthlyIncome(id) {
    let month = date?.toLocaleString("EN-US", { month: "long" });
    let year = date?.getFullYear();
    let payload = {
      params: {
        month,
        year,
        id,
      },
    };
    try{
      let res = await axios.delete(
        `http://localhost:3001/monthlyIncome`,
        payload
      );
      setSnackbarSuccess(true)
      return res.data;
    } catch (err){
      setSnackbarError(true)
    }
  }

  const handleDeleteMonthlyIncome = (id) => {
    deleteMonthlyIncome(id).then(()=>{
      setReason('monthlyIncome')
      setBudgetRefresh(!budgetRefresh);
    })
  };

  const handleAddIncome = () => setOpenAddIncome(true);

  monthlyIncome.sort((a,b)=>{
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
            <Grid item xs={2}>
              <Button
                onClick={handleAddIncome}
                className="add-income-button"
              >
                <AddCircleOutline className="add-income-icon" />
                <Typography component = {'span'}>Add Income Source</Typography>
              </Button>
            </Grid>
            <Grid item xs={10}>
              <Typography component = {'span'} className = 'income-total' variant = 'h6'>
                Total Income: $ {totalIncome}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Grid container justifyContent="center" spacing={4}>
                {monthlyIncome.map((income, id) => {
                  return (
                    <Grid item xs={3} key = {id}>
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
