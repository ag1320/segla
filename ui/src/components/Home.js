import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../AppContext";
import {
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Divider,
  Box,
  CardMedia,
  CardHeader,
  Paper,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import vanguard from "../images/vanguard.png";
import bitcoin from "../images/bitcoin.png";
import dollars from "../images/dollars.png";
import wallet from "../images/wallet.png";
import house from "../images/house.png";
import stock from "../images/stock.png";
import netWorth from "../images/net-worth.png";
import "./Home.css";
import Budget from "./budget/Budget";
import Retirement from "./retirement/Retirement";
import Investments from "./investmentsNew/Investments";
import Reserve from "./reserve/Reserve";
import Loans from "./loans/Loans";
import HomeSummary from "./HomeSummary";

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: "#616161",
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[3],
  maxWidth: 400,
  display: "flex",
  flexDirection: "column",
  height: "100%",
  variant: "outlined",
}));

const StyledCardContent = styled(CardContent)({
  padding: "16px",
  flexGrow: 1,
});

const StyledButton = styled(Button)(({ theme }) => ({
  color: "#BBE1FA",
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  margin: `${theme.spacing(2)} 0`,
}));

export default function Home() {
  const theme = useTheme();
  const [showComponents, setShowComponents] = useState(true);
  const {
    vanguardRetirementTotal,
    tspTotal,
    vanguardBrokerageTotal,
    pa529Total,
    cryptoTotal,
    baskTotal,
    fixedIncome,
    fixedExpenses,
    equityTotal,
    mortgageTotal,
    studentLoanTotal,
    autoLoanTotal,
  } = useContext(AppContext);
  const { cryptoData } = useContext(AppContext);

  const formatCurrency = (value) => {
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const totalRetirement = vanguardRetirementTotal + tspTotal;
  const totalOther = vanguardBrokerageTotal + pa529Total + cryptoTotal;
  const totalReserve = baskTotal;
  const totalIncome = fixedIncome.reduce((accumulator, currentIncome) => {
    return accumulator + currentIncome.amount;
  }, 0);
  const totalFixedExpenses = fixedExpenses.reduce(
    (accumulator, currentExpense) => {
      return accumulator + currentExpense.amount;
    },
    0
  );
  const totalLoan = mortgageTotal + studentLoanTotal + autoLoanTotal;
  const totalAssets = totalRetirement + totalOther + totalReserve + equityTotal;
  const netWorthTotal = totalAssets - totalLoan;

  useEffect(() => {
    setShowComponents(false);
  }, []);

  console.log(cryptoData);
  return (
    <>
      <Box className="content-box">
        <Grid container spacing={5}>
          <Grid item xs={12}>
            <Paper
              sx={{
                backgroundImage:
                  "linear-gradient(to right, #1B262C, #556B78, #1B262C)",
                color: "#FFF",
                padding: "16px",
                marginLeft: "100px",
                marginRight: "100px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Box textAlign="center">
                <Typography variant="h4" component="div">
                  Portfolio Overview
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <HomeSummary />
          </Grid>
          <Grid item xs={12} md={4} lg={3} xl={3}>
            <StyledCard
              sx={{ boxShadow: 20 }}
              className={"grow-card custom-card"}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <CardHeader sx={{ backgroundColor: "rgba(50, 50, 50, 0.8)" }} />
                <CardMedia
                  component="img"
                  height="100"
                  sx={{ objectFit: "contain", marginTop: "10px" }}
                  image={wallet}
                  title="wallet"
                />
                <CardContent>
                  <Typography variant="h5" className="card-text">
                    Budget
                  </Typography>
                  <StyledDivider />
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body1" className="card-text">
                        Fixed Monthly Expenses:
                      </Typography>
                      <Typography variant="h6" className="card-text">
                        {formatCurrency(totalFixedExpenses)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body1" className="card-text">
                        Monthly Income:
                      </Typography>
                      <Typography variant="h6" className="card-text bold-text">
                        {formatCurrency(totalIncome)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
                <div
                  style={{
                    flex: "1",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                  }}
                >
                  <CardActions sx={{ justifyContent: "flex-end" }}>
                    <Link to="/budget">
                      <StyledButton>See More</StyledButton>
                    </Link>
                  </CardActions>
                  <div
                    style={{
                      backgroundColor: "rgba(50, 50, 50, 0.8)",
                      paddingTop: "30px",
                    }}
                  />
                </div>
              </div>
            </StyledCard>
          </Grid>

          <Grid item xs={12} md={4} lg={3} xl={3}>
            <StyledCard
              sx={{ boxShadow: 20 }}
              className={"grow-card custom-card"}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <CardHeader
                  sx={{ backgroundColor: "rgba(255, 165, 0, 0.3)" }}
                />
                <CardMedia
                  component="img"
                  height="100"
                  sx={{ objectFit: "contain" }}
                  image={vanguard}
                  title="vanguard_logo"
                />
                <CardContent>
                  <Typography variant="h5" className="card-text">
                    Retirement Summary
                  </Typography>
                  <StyledDivider />
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body1" className="card-text">
                        Vanguard:
                      </Typography>
                      <Typography variant="h6" className="card-text">
                        {formatCurrency(vanguardRetirementTotal)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body1" className="card-text">
                        TSP:
                      </Typography>
                      <Typography variant="h6" className="card-text">
                        {formatCurrency(tspTotal)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <StyledDivider />
                      <Typography variant="body1" className="card-text">
                        Total :
                      </Typography>
                      <Typography variant="h6" className="card-text bold-text">
                        {formatCurrency(totalRetirement)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
                <div
                  style={{
                    flex: "1",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                  }}
                >
                  <CardActions sx={{ justifyContent: "flex-end" }}>
                    <Link to="/retirement">
                      <StyledButton>See More</StyledButton>
                    </Link>
                  </CardActions>
                  <div
                    style={{
                      backgroundColor: "rgba(255, 165, 0, 0.3)",
                      paddingTop: "30px",
                    }}
                  />
                </div>
              </div>
            </StyledCard>
          </Grid>

          <Grid item xs={12} md={4} lg={3} xl={3}>
            <StyledCard
              sx={{ boxShadow: 20 }}
              className={"grow-card custom-card"}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <CardHeader
                  sx={{ backgroundColor: "rgba(128, 0, 128, 0.3)" }}
                />
                <CardMedia
                  component="img"
                  height="100"
                  sx={{ objectFit: "contain", marginTop: "10px" }}
                  image={stock}
                  title="bitoin_logo"
                />
                <CardContent>
                  <Typography variant="h5" className="card-text">
                    Other Investments
                  </Typography>
                  <StyledDivider />
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body1" className="card-text">
                        Vanguard Brokerage:
                      </Typography>
                      <Typography variant="h6" className="card-text">
                        {formatCurrency(vanguardBrokerageTotal)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body1" className="card-text">
                        529:
                      </Typography>
                      <Typography variant="h6" className="card-text">
                        {formatCurrency(pa529Total)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body1" className="card-text">
                        Crypto:
                      </Typography>
                      <Typography variant="h6" className="card-text">
                        {formatCurrency(cryptoTotal)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <StyledDivider />
                      <Typography variant="body1" className="card-text">
                        Total :
                      </Typography>
                      <Typography variant="h6" className="card-text bold-text">
                        {formatCurrency(totalOther)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
                <div
                  style={{
                    flex: "1",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                  }}
                >
                  <CardActions sx={{ justifyContent: "flex-end" }}>
                    <Link to="/investments">
                      <StyledButton>See More</StyledButton>
                    </Link>
                  </CardActions>
                  <div
                    style={{
                      backgroundColor: "rgba(128, 0, 128, 0.3)",
                      paddingTop: "30px",
                    }}
                  />
                </div>
              </div>
            </StyledCard>
          </Grid>

          <Grid item xs={12} md={4} lg={3} xl={3}>
            <StyledCard
              sx={{ boxShadow: 20 }}
              className={"grow-card custom-card"}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <CardHeader sx={{ backgroundColor: "rgba(0, 128, 0, 0.3)" }} />
                <CardMedia
                  component="img"
                  height="100"
                  sx={{ objectFit: "contain", marginTop: "10px" }}
                  image={dollars}
                  title="dollars"
                />
                <CardContent>
                  <Typography variant="h5" className="card-text">
                    Emergency Fund
                  </Typography>
                  <StyledDivider />
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body1" className="card-text">
                        Bask Bank:
                      </Typography>
                      <Typography variant="h6" className="card-text">
                        {formatCurrency(baskTotal)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <StyledDivider />
                      <Typography variant="body1" className="card-text">
                        Total :
                      </Typography>
                      <Typography variant="h6" className="card-text bold-text">
                        {formatCurrency(totalReserve)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
                <div
                  style={{
                    flex: "1",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                  }}
                >
                  <CardActions sx={{ justifyContent: "flex-end" }}>
                    <Link to="/reserve">
                      <StyledButton>See More</StyledButton>
                    </Link>
                  </CardActions>
                  <div
                    style={{
                      backgroundColor: "rgba(0, 128, 0, 0.3)",
                      paddingTop: "30px",
                    }}
                  />
                </div>
              </div>
            </StyledCard>
          </Grid>

          <Grid item xs={12} md={4} lg={3} xl={3}>
            <StyledCard
              sx={{ boxShadow: 20 }}
              className={"grow-card custom-card"}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <CardHeader
                  sx={{ backgroundColor: "rgba(15, 76, 117, 0.3)" }}
                />
                <CardMedia
                  component="img"
                  height="100"
                  sx={{ objectFit: "contain", marginTop: "10px" }}
                  image={house}
                  title="house"
                />
                <CardContent>
                  <Typography variant="h5" className="card-text">
                    Loans
                  </Typography>
                  <StyledDivider />
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body1" className="card-text">
                        Loan Total:
                      </Typography>
                      <Typography variant="h6" className="card-text">
                        {formatCurrency(totalLoan)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <StyledDivider />
                      <Typography variant="body1" className="card-text">
                        Estimated Equity :
                      </Typography>
                      <Typography variant="h6" className="card-text bold-text">
                        {formatCurrency(equityTotal)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
                <div
                  style={{
                    flex: "1",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                  }}
                >
                  <CardActions sx={{ justifyContent: "flex-end" }}>
                    <Link to="/loans">
                      <StyledButton>See More</StyledButton>
                    </Link>
                  </CardActions>
                  <div
                    style={{
                      backgroundColor: "rgba(15, 76, 117, 0.3)",
                      paddingTop: "30px",
                    }}
                  />
                </div>
              </div>
            </StyledCard>
          </Grid>

          <Grid item xs={12} md={4} lg={3} xl={3}>
            <StyledCard
              sx={{ boxShadow: 20 }}
              className={"grow-card custom-card"}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <CardHeader
                  sx={{ backgroundColor: "rgba(255, 94, 58, 0.3)" }}
                />

                <CardMedia
                  component="img"
                  height="100"
                  sx={{ objectFit: "contain", marginTop: "10px" }}
                  image={bitcoin}
                  title="house"
                />
                <CardContent>
                  <Typography variant="h5" className="card-text">
                    Crypto Summary
                  </Typography>
                  <StyledDivider />
                  <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="body1" className="card-text">
                      Symbol
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body1" className="card-text">
                      Price
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body1" className="card-text">
                      +/-
                    </Typography>
                  </Grid>
                  </Grid>
                  <Grid container spacing={2}>
                    {cryptoData.map((crypto) => {
                      return (
                        <>
                          <Grid item xs={4}>
                            <Typography variant="body1" className="card-text">
                              {`${crypto.ticker}: `}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="body1" className="card-text bold-text">
                              {`$${crypto?.marketValue?.toFixed(2)}`}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="body1" className="card-text bold-text">
                              {`$${crypto?.gains?.toFixed(2)}`}
                            </Typography>
                          </Grid>
                        </>
                      );
                    })}
                  </Grid>
                </CardContent>
                <div
                  style={{
                    flex: "1",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                  }}
                >
                  <CardActions sx={{ justifyContent: "flex-end" }}>
                    <Link to="/investments">
                      <StyledButton>See More</StyledButton>
                    </Link>
                  </CardActions>
                  <div
                    style={{
                      backgroundColor: "rgba(255, 94, 58, 0.3)",
                      paddingTop: "30px",
                    }}
                  />
                </div>
              </div>
            </StyledCard>
          </Grid>
          <Grid item xs={12} md={4} lg={3} xl={3}>
            <StyledCard
              sx={{ boxShadow: 20 }}
              className={"grow-card custom-card"}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <CardHeader
                  sx={{ backgroundColor: "rgba(0, 188, 212, 0.3)" }}
                />
                <CardMedia
                  component="img"
                  height="100"
                  sx={{ objectFit: "contain", marginTop: "10px" }}
                  image={netWorth}
                  title="net worth"
                />
                <CardContent>
                  <Typography variant="h5" className="card-text">
                    Net Worth
                  </Typography>
                  <StyledDivider />
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body1" className="card-text">
                        Assets:
                      </Typography>
                      <Typography variant="h6" className="card-text">
                        {formatCurrency(totalAssets)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body1" className="card-text">
                        Loans:
                      </Typography>
                      <Typography variant="h6" className="card-text">
                        {formatCurrency(totalLoan)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <StyledDivider />
                      <Typography variant="body1" className="card-text">
                        Net Worth:
                      </Typography>
                      <Typography variant="h6" className="card-text bold-text">
                        {formatCurrency(netWorthTotal)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
                <div
                  style={{
                    flex: "1",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "rgba(0, 188, 212, 0.3)",
                      paddingTop: "30px",
                    }}
                  />
                </div>
              </div>
            </StyledCard>
          </Grid>
          <Grid item xs={12} className="page-margin">

          </Grid>
        </Grid>
      </Box>
      <div className="hidden-container">
        <Retirement />
        <Budget />
        <Investments />
        <Reserve />
        <Loans />
      </div>
    </>
  );
}
