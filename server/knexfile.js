import 'dotenv/config';

const config = {
  development: {
    client: 'pg',
    connection: process.env.DB_CONNECTION_STRING,
    debug: true,
  },

  // Same Postgres server as development, separate database. Tests run in
  // WSL, so they reach Postgres through the port docker-compose.dev.yaml
  // publishes.
  test: {
    client: 'pg',
    connection: {
      host: 'localhost',
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: `${process.env.DB_NAME}_test`,
    },
  },

  staging: {
    client: 'pg',
    connection: process.env.DB_CONNECTION_STRING,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },

  production: {
    client: 'pg',
    connection: process.env.DB_CONNECTION_STRING,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
};

export default config;
