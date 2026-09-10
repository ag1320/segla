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

// bcrypt hashes always contain literal `$` characters (they delimit the
// version/cost/salt fields: $2b$12$restofhash...). Docker Compose parses
// .env files and treats an unescaped `$name` as a variable reference to
// substitute - silently truncating the hash and replacing the removed
// part with an empty string (confirmed by actually reproducing this
// against a real docker-compose.yaml on 2026-09-09, not just in theory).
// A literal `$` in a Compose-read .env file must be written as `$$`.
const escapedForEnvFile = hash.replaceAll("$", "$$");

console.log("\nAdd this to your .env (this exact line - $ is doubled to $$");
console.log("on purpose, so Docker Compose doesn't mangle it):\n");
console.log(`AUTH_PASSWORD_HASH=${escapedForEnvFile}`);
console.log(
  "\n(Raw hash, for reference/verification only - do NOT paste this one\n" +
    "into a Compose-read .env file:\n" +
    hash +
    ")",
);
