// Runs before `npm test`: creates the test database if it doesn't exist yet,
// then brings it up to the latest migration.
import knex from "knex";
import knexConfigs from "../knexfile.js";

const testConfig = knexConfigs.test;
const testDatabaseName = testConfig.connection.database;

// CREATE DATABASE has to run from a connection to a different database.
const server = knex({
  client: "pg",
  connection: { ...testConfig.connection, database: "postgres" },
});
const existing = await server.raw(
  "select 1 from pg_database where datname = ?",
  [testDatabaseName],
);
if (existing.rowCount === 0) {
  await server.raw("create database ??", [testDatabaseName]);
}
await server.destroy();

const testDb = knex(testConfig);
await testDb.migrate.latest();
await testDb.destroy();
