# Segla

Segla is Aaron's personal finance dashboard, self-hosted on his homelab VM
behind Caddy. It is growing a business section for Gettemy Properties, his
rental real estate business (sole proprietorship).

The business module is planned in
https://claude.ai/artifact/FMxL3CgjAQHQMmVXVmcYkn. Read its "Coding
conventions" and "Build plan and testing" sections before working on it.

## Working agreement

- **Aaron must always be able to read and hand-edit this codebase.** When in
  doubt, choose the simpler, more readable option over the clever one.
- **Which convention wins:**
  1. Segla's existing style, wherever it is correct.
  2. Where Segla has no precedent and several correct options exist, the
     rules in `~/telos/CLAUDE.md`.
  3. Where Segla's existing way is wrong or bad practice, the correct
     approach (usually the Telos rule). Say so when this happens.
  Never introduce a style that appears in neither codebase.
- The rules below apply to new code. Don't refactor existing code to match
  them unless Aaron asks.
- Work one build step at a time. Stop after each step for Aaron's review.
- Aaron handles all git commits. Claude never commits or pushes.
- Ask before adding a major dependency. Approved so far: Zod, Express 5.
- A migration that has run in prod is never edited; add a new one.
- No progress logs, changelogs, or docs that explain code. Training
  documents for the business module are written separately, at the end.

## Layout

```
server/src/
  app.js                 route registration, central error handler
  routes/                HTTP only: read req, send res
  controllers/           database queries
  services/              business rules (new; business module only)
  middleware/
  utils/
server/migrations/       Knex migrations
ui/src/
  components/<feature>/  React components
  state/<x>Slice.js      Redux Toolkit slices
  utilities/serverCalls.js   every API call (axios)
  utilities/helperFunctions.js  shared selectors and helpers
```

The business module lives in `business/` subfolders:
`routes/business/`, `controllers/business/`, `services/business/`,
`components/business/`, and `state/business<Name>Slice.js`.

## Coding conventions

### General

- JavaScript (not TypeScript), ES modules (`import`/`export`).
- `async/await` only in new code. No `.then()` chains.
- 1–2 inputs: positional params. 3 or more: one object param,
  e.g. `createJournalEntry({ entityId, date, memo, lines })`.
- Formatting matches the existing code: double quotes, semicolons,
  trailing commas.
- Fixed constants are `UPPER_SNAKE_CASE` at the top of the file that uses
  them.

### Server

- `function name() {}` declarations, exported with an `export { ... }` list
  at the bottom of the file. Route files `export default router`.
- Three layers: routes (HTTP only) → services (business rules) →
  controllers (database only). Simple CRUD with no rules may skip the
  service.
- Data functions are named for what they do (`findJournalEntries`,
  `insertJournalEntry`, `lockPeriod`). HTTP verbs only appear in routes.
- Casing: camelCase in routes and services; snake_case in controllers,
  matching the database columns. The service converts when it calls a
  controller. The API returns database rows as-is (snake_case), and the
  UI slice maps them to camelCase.
- Every route validates its input with a Zod schema before the handler
  runs (`middleware/validate.js`, added in step 0.3).
- Errors: services throw the error classes in `utils/errors.js`
  (`ValidationError` 400, `NotFoundError` 404, `ConflictError` 409). Routes
  have no try/catch; Express 5 sends thrown errors to the central handler
  in `app.js`, which maps them to status codes. Anything else becomes a
  generic 500. Never send internal or database error details to the client.
- Only catch an error if you can handle it (retry, fall back, or translate
  it). Never catch, log, and carry on.
- URLs: kebab-case plural nouns, id in the path, the HTTP method is the
  verb. Business routes live under `/business`
  (`GET /business/journal-entries`, `POST /business/journal-entries/:id/reversal`).
  No `/api` prefix, matching the rest of Segla.
- Status codes: 201 for a create, 200 with a body or 204 without one
  otherwise.
- Never build SQL with string interpolation. `knex.raw` always uses
  bindings.

### Database

- Postgres + Knex. Primary keys are `<table singular>_id`
  (`journal_entry_id`, `account_id`).
- `table.timestamps(true, true)` on every table. Calendar dates with no
  time use the `date` type.
- Integrity is enforced with constraints: NOT NULL, foreign keys with an
  explicit `onDelete`, UNIQUE, CHECK. No triggers; business rules live in
  services.
- Money in the business module is integer cents (`amount_cents`, `bigint`).
  Convert to dollars only for display. Never use floats for money.
- Migration names: Knex timestamp + a snake_case description starting with
  a verb (`create_journal_entries`, `add_status_to_properties`).

### Business ledger rules

- Every journal entry balances (debits = credits). The posting service
  checks this and writes the entry and its lines in one transaction.
- Posted entries are never edited or deleted. Mistakes are fixed with a
  reversing entry.
- Nothing posts into a locked period.
- Receipts are not linked to entries in any way.

### UI

- MUI components, styled with `sx` (the existing pattern).
- Components: `export default function ComponentName() {}`, one component
  per file, `PascalCase.js`.
- Server state: `createAsyncThunk` in a slice, dispatched from a
  `useEffect` on mount; API calls live in `utilities/serverCalls.js`
  (add a `// BUSINESS` section).
- One job per component. ~150 lines is a warning sign. Move long or reused
  logic into a custom hook.
- State lives in the lowest component that reads it. A parent passes
  `value` plus an `onX` prop (`onChange`, `onSave`); never props named
  `setX`.
- List keys are stable ids, never the array index.
- No `useMemo`, `useCallback` or `React.memo` unless there is a measured
  performance problem or a stable reference is genuinely required.
- `useEffect` is for syncing with something outside React (fetching on
  mount, timers, listeners), never for computing values from props/state
  or reacting to user actions. Never suppress `react-hooks/exhaustive-deps`.
- No in-app documentation. Screens carry headers and brief tooltips only.

### Comments

- Code speaks through names. Comments are rare and explain *why*.
- No history comments ("was X", "fixed on ..."); git holds history.
- No commented-out code, no TODO comments, no debug `console.log`s.

### Tests

- `node:test` (built in), run with `npm test` in `server/`, against a
  separate test database. Only the accounting rules are tested: entries
  balance, assets = liabilities + equity, locked periods can't change,
  statements tie to each other.

## Git and deploy

- Business module work happens on the `business-module` branch and merges
  to `main` only at go-live. `main` must always be deployable.
- Never deploy `business-module` to the VM: the server runs
  `knex migrate:latest` on start.
- Deploy (VM): `git pull`, then `docker compose up --build -d`.
