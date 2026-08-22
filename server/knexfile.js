import 'dotenv/config';

const config = {
  development: {
    client: 'pg',
    connection: process.env.DB_CONNECTION_STRING,
    debug: true,
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
