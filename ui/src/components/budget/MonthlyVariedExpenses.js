import { useContext, useState, Fragment } from "react";
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
  LinearProgress,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
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

const getStatusColor = (comparison) => {
  if (!comparison) return null;
  if (comparison.limit) return "#ef5350";
  if (comparison.warning) return "#ff9800";
  if (comparison.limitAmount) return "#66bb6a";
  return null;
};

const getProgressColor = (pct) => {
  if (pct >= 100) return "#ef5350";
  if (pct >= 80) return "#ff9800";
  return "#66bb6a";
};

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
    let payload = { params: { id } };
    try {
      let res = await axios.delete(
        `http://localhost:3001/monthlyVariedExpenses`,
        payload,
      );
      setSnackbarSuccess(true);
      return res.data;
    } catch (err) {
      setSnackbarError(true);
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
      setReason("monthlyVaried");
      setBudgetRefresh(!budgetRefresh);
    });
  };

  displayBudgetCategories.sort((a, b) => {
    let textA = a.toLowerCase();
    let textB = b.toLowerCase();
    return textA < textB ? -1 : textA > textB ? 1 : 0;
  });

  budgetComparison.sort((a, b) => {
    let textA = a.category.toLowerCase();
    let textB = b.category.toLowerCase();
    return textA < textB ? -1 : textA > textB ? 1 : 0;
  });

  return (
    <>
      {date ? (
        <>
          <AddExpenseModal />
          <Grid container alignItems="center" sx={{ mb: 3 }}>
            <Grid item xs={2}>
              <Button
                onClick={handleAddExpense}
                startIcon={<AddCircleOutline />}
                variant="outlined"
                sx={{
                  color: "#4fc3f7",
                  borderColor: "#4fc3f7",
                  "&:hover": {
                    borderColor: "#81d4fa",
                    backgroundColor: "rgba(79,195,247,0.08)",
                  },
                }}
              >
                Add Expense
              </Button>
            </Grid>
            <Grid item xs={10}>
              <Typography variant="h6" sx={{ color: "#fff" }}>
                Total Monthly Expenses: ${totalSpent}
              </Typography>
            </Grid>
          </Grid>
          <Grid container spacing={3} justifyContent="flex-start">
            {displayBudgetCategories.map((category, index) => {
              const comparison = budgetComparison[index];
              const statusColor = getStatusColor(comparison);
              const pct = comparison?.limitAmount
                ? Math.min(
                    (comparison.subtotal / comparison.limitAmount) * 100,
                    100,
                  )
                : null;

              return (
                <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
                  <Card
                    sx={{
                      backgroundColor: "#243447",
                      color: "#fff",
                      borderRadius: 2,
                      borderTop: `3px solid ${statusColor ?? "transparent"}`,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                      transition: "transform 0.15s ease, box-shadow 0.15s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
                      },
                    }}
                  >
                    <CardHeader
                      title={
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            color: "#fff",
                            lineHeight: 1.3,
                          }}
                        >
                          {category}
                        </Typography>
                      }
                      subheader={
                        <Typography
                          variant="caption"
                          sx={{ color: "rgba(255,255,255,0.6)" }}
                        >
                          ${comparison?.subtotal?.toFixed(2) ?? "0.00"}
                          {comparison?.limitAmount
                            ? ` / $${comparison.limitAmount}`
                            : ""}
                        </Typography>
                      }
                      sx={{ pb: pct !== null ? 0 : 1 }}
                    />
                    {pct !== null && (
                      <Box sx={{ px: 2, pb: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: "rgba(255,255,255,0.1)",
                            "& .MuiLinearProgress-bar": {
                              backgroundColor: getProgressColor(pct),
                              borderRadius: 3,
                            },
                          }}
                        />
                      </Box>
                    )}
                    <CardActions disableSpacing sx={{ pt: 0 }}>
                      <ExpandMore
                        expand={expandedId === index}
                        onClick={() => handleExpandClick(index)}
                        aria-expanded={expandedId === index}
                        aria-label="show more"
                        sx={{ color: "rgba(255,255,255,0.7)" }}
                      >
                        <ExpandMoreIcon />
                      </ExpandMore>
                    </CardActions>
                    <Collapse
                      in={expandedId === index}
                      timeout="auto"
                      unmountOnExit
                    >
                      <CardContent sx={{ pt: 0, pb: "8px !important" }}>
                        <Box
                          sx={{
                            maxHeight: 240,
                            overflowY: "auto",
                            overflowX: "hidden",
                            borderRadius: 1,
                            "&::-webkit-scrollbar": { width: 4 },
                            "&::-webkit-scrollbar-track": {
                              background: "rgba(255,255,255,0.05)",
                              borderRadius: 2,
                            },
                            "&::-webkit-scrollbar-thumb": {
                              background: "rgba(79,195,247,0.4)",
                              borderRadius: 2,
                            },
                          }}
                        >
                          <List dense disablePadding>
                            {monthlyVariedExpenses
                              .filter((e) => e.category === category)
                              .map((variedExpense, id, arr) => (
                                <Fragment key={id}>
                                  <ListItem
                                    disableGutters
                                    sx={{
                                      px: 1.5,
                                      py: 0.5,
                                      backgroundColor:
                                        id % 2 === 0
                                          ? "rgba(255,255,255,0.03)"
                                          : "transparent",
                                      "&:hover": {
                                        backgroundColor:
                                          "rgba(79,195,247,0.08)",
                                      },
                                    }}
                                    secondaryAction={
                                      <IconButton
                                        edge="end"
                                        size="small"
                                        onClick={() =>
                                          handleExpenseDelete(
                                            variedExpense.monthly_expenses_id,
                                          )
                                        }
                                        sx={{
                                          color: "rgba(255,255,255,0.3)",
                                          "&:hover": { color: "#ef5350" },
                                        }}
                                      >
                                        <ClearIcon fontSize="inherit" />
                                      </IconButton>
                                    }
                                  >
                                    <ListItemText
                                      primary={variedExpense.subcategory || ""}
                                      secondary={`$${variedExpense.amount}`}
                                      primaryTypographyProps={{
                                        variant: "body2",
                                        sx: { color: "#e0f4ff" },
                                      }}
                                      secondaryTypographyProps={{
                                        variant: "caption",
                                        sx: {
                                          color: "#4fc3f7",
                                          fontWeight: 600,
                                        },
                                      }}
                                    />
                                  </ListItem>
                                  {id < arr.length - 1 && (
                                    <Divider
                                      sx={{
                                        borderColor: "rgba(255,255,255,0.06)",
                                      }}
                                    />
                                  )}
                                </Fragment>
                              ))}
                          </List>
                        </Box>
                      </CardContent>
                    </Collapse>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </>
      ) : (
        <Typography sx={{ color: "#fff" }}>
          Please Select a Budget Month
        </Typography>
      )}
    </>
  );
}
