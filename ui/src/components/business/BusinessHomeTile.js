import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Button, Card, CardActions, CardContent, CardHeader, CardMedia, Divider, Grid, Typography } from "@mui/material";
import { loadBusinessDashboard } from "../../state/businessDashboardSlice";
import { formatCents } from "./businessFormat";
import house from "../../images/house.png";

// Same look as the other Home cards (see Home.js's StyledCard).
const CARD_SX = {
  backgroundColor: "#616161",
  borderRadius: 4,
  boxShadow: 20,
  maxWidth: 400,
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  height: "100%",
};
const ACCENT = "rgba(50, 130, 184, 0.4)";

// [label, value] rows for the business's phase.
function tileLines(dashboard) {
  if (dashboard.phase === "operating") {
    return [
      ["NOI this year:", formatCents(dashboard.operating.noiYtdCents)],
      ["Cash flow this month:", formatCents(dashboard.operating.cashFlowThisMonthCents)],
    ];
  }
  return [
    ["Cash:", formatCents(dashboard.cashCents)],
    ["Contributed:", formatCents(dashboard.contributedCents)],
    ["Spent:", formatCents(dashboard.spentCents)],
  ];
}

// Gettemy Properties on Home: before launch, cash and money in and out;
// once a property is in service, NOI and this month's cash flow.
export default function BusinessHomeTile() {
  const dispatch = useDispatch();
  const dashboard = useSelector((state) => state.businessDashboard.data);

  useEffect(() => {
    dispatch(loadBusinessDashboard());
  }, [dispatch]);

  const lines = dashboard ? tileLines(dashboard) : [];

  return (
    <Card sx={CARD_SX} className="grow-card custom-card">
      <CardHeader sx={{ backgroundColor: ACCENT }} />
      <CardMedia component="img" height="100" sx={{ objectFit: "contain", marginTop: "10px" }} image={house} title="rental" />
      <CardContent>
        <Typography variant="h5" className="card-text">
          Gettemy Properties
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          {lines.map(([label, value]) => (
            <Grid item xs={12} key={label}>
              <Typography variant="body1" className="card-text">{label}</Typography>
              <Typography variant="h6" className="card-text">{value}</Typography>
            </Grid>
          ))}
          {dashboard && dashboard.phase === "pre_launch" && dashboard.daysToConversion !== null && (
            <Grid item xs={12}>
              <Typography variant="body2" className="card-text">
                {`${dashboard.daysToConversion} days until conversion`}
              </Typography>
            </Grid>
          )}
        </Grid>
      </CardContent>
      <div style={{ flex: "1", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
        <CardActions sx={{ justifyContent: "flex-end" }}>
          <Link to="/business">
            <Button sx={{ color: "#BBE1FA" }}>See More</Button>
          </Link>
        </CardActions>
        <div style={{ backgroundColor: ACCENT, paddingTop: "30px" }} />
      </div>
    </Card>
  );
}
