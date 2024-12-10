require('dotenv').config({ path: '../../.env' });
pg = require('pg')

//This tells it to use parseFloat on all numeric/decimals because otherwise default is return string
//https://github.com/knex/knex/issues/927
pg.types.setTypeParser(1700, 'text', parseFloat)

const knex = require('knex');

const knexConfigs = require('../knexfile.js')

const config = knexConfigs[process.env.NODE_ENV];

const dbConnection = knex(config);

module.exports = dbConnection;