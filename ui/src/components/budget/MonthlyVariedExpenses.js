import { useContext, useState } from "react";
import ClearIcon from "@mui/icons-material/Clear";
import { styled } from "@mui/material/styles";
import { AppContext } from "../../AppContext";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import AddExpenseModal from "./AddExpenseModal";
import axios from "axios";
import "./MonthlyVariedExpenses.css";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Button,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Collapse,
  IconButton,
  Typography,
  CardActions,
  Chip,
} from "@mui/material";

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

export default function MonthlyVariedExpenses() {
  let { date } = useContext(AppContext);
  let { setOpenAddExpense } = useContext(AppContext);
  let { monthlyVariedExpenses } = useContext(AppContext);
  let { budgetRefresh, setBudgetRefresh } = useContext(AppContext);
  let { setReason } = useContext(AppContext);
  let { setSnackbarSuccess, setSnackbarError } = useContext(AppContext);
  let { budgetComparison } = useContext(AppContext);
  let { displayBudgetCategories } = useContext(AppContext);
  let { totalSpent } = useContext(AppContext);
  let [expandedId, setExpandedId] = useState(false);

  async function deleteExpense(id) {
    let payload = {
      params: {
        id,
      },
    };
    try{
      let res = await axios.delete(
        `http://localhost:3001/monthlyVariedExpenses`,
        payload
        );
        setSnackbarSuccess(true)
        return res.data;
    } catch (err){
      setSnackbarError(true)
    }
  }

  
  const handleExpandClick = (index) => {
    setExpandedId(expandedId === index ? -1 : index);
  };
  
  const handleAddExpense = () => {
    setOpenAddExpense(true);
  };
  
  const handleExpenseDelete = (id) => {
    deleteExpense(id).then(() => {
      setReason('monthlyVaried')
      setBudgetRefresh(!budgetRefresh)
    })
  };

  displayBudgetCategories.sort((a,b)=>{
    let textA = a.toLowerCase()
    let textB = b.toLowerCase()
    return (textA < textB ) ? -1: (textA> textB) ? 1: 0;
  })

  budgetComparison.sort((a,b)=>{
    let textA = a.category.toLowerCase()
    let textB = b.category.toLowerCase()
    return (textA < textB ) ? -1: (textA> textB) ? 1: 0;
  })

  return (
    <>
      {date ? (
        <>
          <AddExpenseModal />
          <Grid container>
            <Grid item xs={2}>
              <Button onClick={handleAddExpense} className="add-expense-button">
                <AddCircleOutline className="add-expense-icon" />
                <Typography component = {'span'}>Add Expense</Typography>
              </Button>
            </Grid>
            <Grid item xs={10}>
              <Typography component = {'span'} className="monthly-expenses-total" variant="h6">
                Total Monthly Expenses: $ {totalSpent}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={4} justifyContent="space-around">
                {displayBudgetCategories.map((category, index) => {
                  return (
                    <Grid item xs={4} md={3} lg={2} key = {index}>
                      <Card>
                        <div
                          className="expense-card"
                          red={`${budgetComparison[index]?.limit}`}
                          orange={
                            budgetComparison[index]?.limit
                              ? "false"
                              : `${budgetComparison[index]?.warning}`
                          }
                        >
                          <CardHeader
                            title={category}
                            subheader={
                              `$ ${budgetComparison[index]?.subtotal.toFixed(2)} 
                              of $ ${budgetComparison[index]?.limitAmount}`
                            }
                          />
                          <CardActions>
                            <ExpandMore
                              expand={expandedId === index}
                              onClick={() => handleExpandClick(index)}
                              aria-expanded={expandedId === index}
                              aria-label="show more"
                            >
                              <ExpandMoreIcon />
                            </ExpandMore>
                          </CardActions>
                          <Collapse
                            in={expandedId === index}
                            timeout="auto"
                            unmountOnExit
                          >
                            <CardContent>
                              <Grid container spacing={2}>
                                {monthlyVariedExpenses.map((variedExpense, id) => {
                                  if (variedExpense.category === category) {
                                    return (
                                      <Grid item xs={"auto"} key = {id}>
                                        <Chip
                                          label={
                                            variedExpense.subcategory
                                              ? `${variedExpense.subcategory} - $ ${variedExpense.amount}`
                                              : `$ ${variedExpense.amount}`
                                          }
                                          onDelete={() =>
                                            handleExpenseDelete(
                                              variedExpense.monthly_expenses_id
                                            )
                                          }
                                          deleteIcon={<ClearIcon />}
                                          variant="outlined"
                                        />
                                      </Grid>
                                    );
                                  } else {
                                    return <></>
                                  }
                                })}
                              </Grid>
                            </CardContent>
                          </Collapse>
                        </div>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>
          </Grid>
        </>
      ) : (
        <Typography component = {'span'} style = {{color: '#FFF'}}>Please Select a Budget Month</Typography>
      )}
    </>
  );
}
