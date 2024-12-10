# Finance App

A robust finance application designed to track, analyze, and manage financial data. This application integrates with a database and third-party APIs to provide dynamic and insightful financial tools.

## Table of Contents

1. [Features](#features)
2. [Technologies Used](#technologies-used)
3. [Getting Started](#getting-started)
4. [Setting Up the Environment Variables](#setting-up-the-environment-variables)
5. [Running the Application](#running-the-application)
6. [Contributing](#contributing)
7. [License](#license)

## Features

- **Database Integration**: Seamlessly connects to a PostgreSQL database.
- **API Integration**: Fetch live financial data using CoinGecko.
- **Scalable Environment**: Optimized for local environments.

## Technologies Used

- **Node.js**
- **Express.js**
- **PostgreSQL**
- **Knex.js**
- **CoinGecko API**
- **Docker**

## Getting Started

Follow these steps to set up the project on local machine:

### Prerequisites

- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Git](https://git-scm.com/)
- A CoinGecko API key (available at [CoinGecko Developer Portal](https://www.coingecko.com/en/api))

### Installation

1. Clone the repository:

   ```bash
   git clone git@github.com:your-username/your-repo.git
   cd your-repo
   ```

2. Set up the database:

   - Ensure PostgreSQL is installed and running.

3. Set up your `.env` file as described below.

## Setting Up the Environment Variables

Create a `.env` file in the root directory of the project. Populate it with the following variables:

```env
# Database Configuration
DB_USER=your_database_username
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
DB_PORT=your_database_port
DB_CONNECTION_STRING=postgres://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}

# Environment
NODE_ENV=development

# API Key
COIN_GECKO_API_KEY=your_coin_gecko_api_key
```

### Notes:

- Replace `your_database_username`, `your_database_password`, `your_database_name`, and `your_database_port` with your PostgreSQL configuration.
- Replace `your_coin_gecko_api_key` with the API key obtained from CoinGecko.

## Running the Application

1. Start the application:

   ```bash
   run the segla.sh script
   ```

2. Access the application at `http://localhost:3000`.
