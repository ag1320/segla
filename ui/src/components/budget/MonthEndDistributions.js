import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import AddDistributionModal from "./AddDistributionModal";
import ClearIcon from "@mui/icons-material/Clear";
import "./MonthEndDistributions.css";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import {
  loadMonthEndDistributions,
  removeMonthEndDistribution,
} from "../../state/monthEndDistributionsSlice";
import { setSnackbarSuccess, setSnackbarError } from "../../state/uiSlice";
import { selectBudgetBalance } from "../../utilities/helperFunctions";
import {
  Button,
  Grid,
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Typography,
  Divider,
} from "@mui/material";

export default function MonthEndDistributions() {
  const dispatch = useDispatch();
  const date = useSelector((state) => state.budget.date);
  const monthEndDistributions = useSelector((state) => state.monthEndDistributions.items);
  const { totalDistributions } = useSelector(selectBudgetBalance);
  let [openAddDistribution, setOpenAddDistribution] = useState(false);

  const handleAddDistribution = () => setOpenAddDistribution(true);

  useEffect(() => {
    if (date) {
      let month = date.toLocaleString("EN-US", { month: "long" });
      let year = date.getFullYear();
      dispatch(loadMonthEndDistributions({ month, year }));
    }
  }, [date, dispatch]);

  const handleDeleteMonthlyDistribution = (id) => {
    let month = date?.toLocaleString("EN-US", { month: "long" });
    let year = date?.getFullYear();
    dispatch(removeMonthEndDistribution({ id, month, year }))
      .unwrap()
      .then(() => dispatch(setSnackbarSuccess(true)))
      .catch(() => dispatch(setSnackbarError(true)));
  };

  monthEndDistributions.sort((a,b)=>{
    let textA = a.category.toLowerCase()
    let textB = b.category.toLowerCase()
    return (textA < textB ) ? -1: (textA> textB) ? 1: 0;
  })

  return (
    <>
      {date ? (
        <>
          <AddDistributionModal
            open={openAddDistribution}
            setOpen={setOpenAddDistribution}
          />
          <Grid container>
            <Grid item xs={2}>
              <Button
                onClick={handleAddDistribution}
                className="add-distribution-button"
              >
                <AddCircleOutline className="add-distribution-icon" />
                <Typography component = {'span'}>Add Distribution</Typography>
              </Button>
            </Grid>
            <Grid item xs={10}>
              <Typography component = {'span'} className="monthly-distributions-total" variant="h6">
                Total Month End Distributions: $ {totalDistributions}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Grid container justifyContent="center" spacing={4}>
                {monthEndDistributions.map((distribution) => {
                  return (
                    <Grid item xs={3}>
                      <Card style={{ marginTop: "50px" }}>
                        <CardHeader
                          title={distribution.category}
                          action={
                            <IconButton
                              onClick={() =>
                                handleDeleteMonthlyDistribution(
                                  distribution.monthly_expenses_id
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
                                $ {distribution.amount.toFixed(2)}
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
        <Typography component = {'span'} style={{ color: "#FFF" }}>
          Please Select a Budget Month
        </Typography>
      )}
    </>
  );
}
