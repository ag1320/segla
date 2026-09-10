#!/usr/bin/env node
// Generates the bcrypt hash to put in .env as AUTH_PASSWORD_HASH.
//
// Usage:
//   npm run hash-password
// (prompts for the password so it never lands in your shell history or
// process list - `node scripts/hashPassword.js "my password"` would leak
// it via `ps`/history instead)
import bcrypt from "bcryptjs";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const rl = createInterface({ input: stdin, output: stdout });

// readline has no built-in "don't echo the input" mode without pulling in
// a TTY-raw-mode dependency; good enough for a one-time local setup step,
// just don't run this over someone's shoulder.
const password = await rl.question("Password to hash: ");
rl.close();

if (!password) {
  console.error("No password entered.");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
console.log("\nAdd this to your .env:\n");
console.log(`AUTH_PASSWORD_HASH=${hash}`);
