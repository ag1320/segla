import { test, after } from "node:test";
import assert from "node:assert/strict";
import dbConnection from "../src/controllers/dbConnection.js";

after(() => dbConnection.destroy());

test("the test database has every migration applied", async () => {
  const [, pendingMigrations] = await dbConnection.migrate.list();
  assert.equal(pendingMigrations.length, 0);
});
