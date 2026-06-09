# Segla — Personal Finance Dashboard

A full-stack personal finance application for tracking investments, managing monthly budgets, monitoring loans and equity, and generating spending reports. Built for local deployment using Docker.

## Features

### Investments
- Track traditional and crypto investment portfolios with live price data via Yahoo Finance API
- Log buy/sell transactions per ticker with cost basis tracking
- Manage discrete investment accounts: Vanguard retirement, Vanguard brokerage, TSP, PA 529, Bask savings, and crypto
- Track loans (balance, rate, payoff date, monthly payment) and home equity

### Budget
- Define fixed income sources and fixed monthly expenses
- Create and manage monthly budgets with custom spending categories and per-category limits
- Log varied (discretionary) expenses against budget categories
- Record month-end distributions (e.g. savings transfers)
- Export monthly budget data to CSV
- Add notes to any budget month for context

### Reporting
- Generate spending reports across configurable date ranges
- View total spending trends and category breakdowns
- Surface budget warnings and over-limit categories

### Crypto
- Fetch live crypto market data via CoinGecko API
- Track coin holdings, cost basis, and current value

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| ORM / Migrations | Knex.js |
| External APIs | Yahoo Finance, CoinGecko |
| Containerization | Docker, Docker Compose |
| Utilities | Lodash, Morgan |

## Project Structure

```
segla/
├── ui/                  # React frontend
├── server/              # Express backend
│   ├── app.js           # Route definitions
│   ├── controllers/     # Database and API logic
│   ├── migrations/      # Knex DB migrations
│   └── seeds/           # Seed data
├── docker-compose.yaml
└── segla.sh             # One-command startup script
```

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)
- A [CoinGecko API key](https://www.coingecko.com/en/api)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/ag1320/segla.git
cd segla
```

2. Create a `.env` file in the root directory:

```env
# Database
DB_USER=your_database_username
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
DB_PORT=5432
DB_CONNECTION_STRING=postgres://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}

# Environment
NODE_ENV=development

# APIs
COIN_GECKO_API_KEY=your_coingecko_api_key
```

### Running the Application

```bash
bash segla.sh
```

The app will be available at `http://localhost:3000`. The backend runs on port `3001`.

## API Overview

The Express server exposes REST endpoints organized around the app's core domains:

| Domain | Endpoints |
|---|---|
| Investments (legacy) | `GET/POST/DELETE /transaction`, `GET /data`, `PATCH /shares` |
| Vanguard Retirement | `GET/POST/PATCH/DELETE /vanguardRetirement` |
| TSP | `GET/POST/PATCH/DELETE /tsp` |
| Vanguard Brokerage | `GET/POST/PATCH/DELETE /vanguardBrokerage` |
| PA 529 | `GET/POST/PATCH/DELETE /pa529` |
| Crypto | `GET/POST/PATCH/DELETE /crypto`, `GET /crypto-market` |
| Bask Savings | `GET/POST/PATCH/DELETE /bask` |
| Loans | `GET/POST/PATCH/DELETE /loans` |
| Equity | `GET/POST/PATCH/DELETE /equity` |
| Budget | `POST /budget`, `DELETE /budget`, `POST /budget/check` |
| Fixed Expenses | `GET/POST/PATCH/DELETE /fixedExpenses` |
| Fixed Income | `GET/POST/PATCH/DELETE /fixedIncome` |
| Monthly Expenses | `GET/POST/DELETE /monthlyExpenses` |
| Budget Categories | `GET/POST/PATCH/DELETE /budgetCategories` |
| Month-End Distributions | `GET/POST/DELETE /monthEndDistributions` |
| Reports | `GET /reportData` |
| Notes | `GET/POST/DELETE /notes` |
| CSV Export | `GET /exportCSV` |
