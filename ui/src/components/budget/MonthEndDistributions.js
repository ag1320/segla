import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../AppContext";
import AddDistributionModal from "./AddDistributionModal";
import ClearIcon from "@mui/icons-material/Clear";
import "./MonthEndDistributions.css";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import axios from "axios";
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
  let { date } = useContext(AppContext);
  let { budgetRefresh, setBudgetRefresh } = useContext(AppContext);
  let { totalDistributions } = useContext(AppContext);
  let { setReason } = useContext(AppContext);
  let { setSnackbarSuccess, setSnackbarError } = useContext(AppContext);
  let { monthEndDistributions, setMonthEndDistributions } =
    useContext(AppContext);
  let [openAddDistribution, setOpenAddDistribution] = useState(true);

  const handleAddDistribution = () => setOpenAddDistribution(true);

  async function getMonthEndDistributions() {
    let month = date?.toLocaleString("EN-US", { month: "long" });
    let year = date?.getFullYear();
    let payload = {
      month,
      year,
    };
      let res = await axios.get(`http://localhost:3001/monthEndDistributions`, {
        params: payload,
      });
      return res.data;
  }

  async function deleteMonthlyDistribution(id) {
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
        `http://localhost:3001/monthEndDistributions`,
        payload
      );
      setSnackbarSuccess(true)
      return res.data;
    } catch (err) {
      setSnackbarError(true)
    }
  }

  useEffect(() => {
    let mounted = true;
    if (!date){
      setMonthEndDistributions([]);
    }
    if (mounted && date) {
      getMonthEndDistributions()
        .then((items) => {
          setMonthEndDistributions(items);
        })
    }
    return () => (mounted = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, budgetRefresh]);

  const handleDeleteMonthlyDistribution = (id) => {
    deleteMonthlyDistribution(id).then(() => {
      setReason('distribution')
      setBudgetRefresh(!budgetRefresh)
    });
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
