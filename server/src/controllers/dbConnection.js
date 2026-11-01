import 'dotenv/config';
import knex from 'knex';
import pg from 'pg';
import knexConfigs from '../../knexfile.js';

// This tells it to use parseFloat on all numeric/decimals because otherwise default is returning string
// https://github.com/knex/knex/issues/927
pg.types.setTypeParser(1700, 'text', parseFloat);

// Same for bigint, which the business module uses for money in cents. pg
// returns it as a string because bigint can exceed JS's safe integer
// range; a cents amount never will.
pg.types.setTypeParser(20, 'text', Number);

// Set the environment to development by default if it's not set in process.env
const environment = process.env.NODE_ENV || 'development';

// Get the appropriate Knex config based on the environment
const knexConfig = knexConfigs[environment];

// Initialize the knex connection
const dbConnection = knex(knexConfig);

export default dbConnection;
