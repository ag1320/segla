//npm install express pg knex morgan cors axios
import express from "express";
import morgan from "morgan";
import cors from "cors";
import vanguardRetirementRoutes from "./routes/vanguardRetirementRoutes.js";
import tspRoutes from "./routes/tspRoutes.js";
import vanguardBrokerageRoutes from "./routes/vanguardBrokerageRoutes.js";
import pa529Routes from "./routes/pa529Routes.js";
import cryptoRoutes from "./routes/cryptoRoutes.js";
import baskRoutes from "./routes/baskRoutes.js";
import loansRoutes from "./routes/loansRoutes.js";
import equityRoutes from "./routes/equityRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import fixedExpensesRoutes from "./routes/fixedExpensesRoutes.js";
import fixedIncomeRoutes from "./routes/fixedIncomeRoutes.js";
import monthlyIncomeRoutes from "./routes/monthlyIncomeRoutes.js";
import monthlyExpensesRoutes from "./routes/monthlyExpensesRoutes.js";
import budgetCategoriesRoutes from "./routes/budgetCategoriesRoutes.js";
import monthEndDistributionsRoutes from "./routes/monthEndDistributionsRoutes.js";
import notesRoutes from "./routes/notesRoutes.js";
import reportsRoutes from "./routes/reportsRoutes.js";

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(
  cors({
    origin: "*",
    methods: "GET, PUT, POST, PATCH, DELETE",
  }),
);

// Routes
app.use(vanguardRetirementRoutes);
app.use(tspRoutes);
app.use(vanguardBrokerageRoutes);
app.use(pa529Routes);
app.use(cryptoRoutes);
app.use(baskRoutes);
app.use(loansRoutes);
app.use(equityRoutes);
app.use(budgetRoutes);
app.use(fixedExpensesRoutes);
app.use(fixedIncomeRoutes);
app.use(monthlyIncomeRoutes);
app.use(monthlyExpensesRoutes);
app.use(budgetCategoriesRoutes);
app.use(monthEndDistributionsRoutes);
app.use(notesRoutes);
app.use(reportsRoutes);

const port = process.env.PORT || 4001;
app.listen(port, () =>
  console.log(`Backend listening at http://localhost:${port}`),
);
