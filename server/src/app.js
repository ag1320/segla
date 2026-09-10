//npm install express pg knex morgan cors axios cookie-parser jsonwebtoken bcryptjs express-rate-limit helmet
import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
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
import authRoutes from "./routes/authRoutes.js";
import { requireAuth } from "./middleware/auth.js";
import { sendError } from "./utils/sendError.js";

// Fail closed, not open: if the app were ever started without these set,
// the alternative is either crashing inside a request (AUTH_PASSWORD_HASH
// missing -> bcrypt throws) or, worse, someone forgetting to set
// JWT_SECRET and a hardcoded/empty fallback silently making every token
// forgeable. Refuse to boot instead.
const REQUIRED_ENV = ["AUTH_USERNAME", "AUTH_PASSWORD_HASH", "JWT_SECRET"];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(
    `Missing required environment variable(s): ${missing.join(", ")}. ` +
      "See AUTH.md for setup (run `npm run hash-password` in server/ to generate AUTH_PASSWORD_HASH).",
  );
  process.exit(1);
}

const app = express();

// Behind Caddy (or any reverse proxy) in production - needed so req.ip
// (rate limiting) and req.secure reflect the real client/connection
// instead of the proxy hop.
app.set("trust proxy", 1);

// crossOriginResourcePolicy defaults to "same-origin", which would make
// Chrome block the frontend's cross-origin fetches even with CORS headers
// present - segla.keylimedesigns.dev calling segla-api.keylimedesigns.dev
// is a different origin by design (see SERVER_MIGRATION.md §8), so this
// API needs to opt back in to being fetched cross-origin.
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Locked to known frontend origins - was `origin: "*"`, which can't be
// combined with credentials:true anyway (browsers reject that combo), and
// wildcard CORS on an API that now sits behind a login is exactly the kind
// of thing worth being deliberate about. CORS_ORIGIN in .env is a
// comma-separated list; defaults cover local dev only.
const allowedOrigins = (
  process.env.CORS_ORIGIN || "http://localhost:3000,http://localhost:4000"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // `origin` is undefined for same-origin/non-browser requests (curl,
      // server-to-server health checks) - allow those through.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: "GET, PUT, POST, PATCH, DELETE",
  }),
);

// Auth routes are reachable without a session (you need them to get one).
app.use(authRoutes);

// Everything below this line requires a valid session cookie.
app.use(requireAuth);

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

// Safety net for anything that doesn't go through a route's own .catch()
// (e.g. express.json() choking on malformed JSON, a synchronous throw) -
// without this, Express's own default handler takes over, which dumps a
// stack trace into the response body outside of production.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  sendError(res, err);
});

const port = process.env.PORT || 4001;
app.listen(port, () =>
  console.log(`Backend listening at http://localhost:${port}`),
);
