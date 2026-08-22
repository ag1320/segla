# Segla restructure: progress / resume notes

Written mid-task because of token-budget concerns. Full plan lives at
`C:\Users\aaron\.claude\plans\clever-hugging-ember.md` (still accurate - read
that first for the full context/rationale, this file is just "what's actually
done on disk right now").

Task list (use `TaskList`/`TaskGet` to see live status - this file is a
snapshot as of the point I paused):
- #1 Backend restructure — **DONE**
- #2 Redux infrastructure — **DONE**
- #3 Migrate investments-new components — **DONE** (vanguardRetirement, tsp,
  vanguardBrokerage, pa529, bask, crypto + GetCryptoData, RetirementSummary,
  InvestmentSummary, ReserveSummary - 34 files, zero remaining AppContext
  imports in retirement/investmentsNew/reserve directories, confirmed by grep)
- #4 Migrate Loans + Equity components — **DONE** (12 files: Loans, Loan,
  LoanSummary, Add/Edit/ConfirmDelete for loans, Equity + its Add/Edit/ConfirmDelete)
- #5 Migrate Budget domain components — **DONE** (~26 files; deleted the
  now-obsolete `BudgetFunctions.js`, confirmed zero remaining `BudgetFunctions`
  importers before deleting)
- #6 Migrate Reports/Home/Navbar/Snackbar, remove AppContext — **DONE**.
  `AppSnackbar.js` → `uiSlice`. `GenerateReportModal.js`/`ReportModal.js` →
  `reportsSlice` grew 5 new plain fields (`reportStartDate`, `reportEndDate`,
  `reportSelectedCategories`, `reportSelectedTypeCategories` + a
  `clearReportData` reducer) since those two modals are siblings (not
  parent/child) invoked from `Budget.js`, so the shared state has to live in
  Redux, not a lifted local state. `Navbar.js` needed zero changes (never
  touched AppContext). `Home.js`/`HomeSummary.js` migrated - and the old
  "hidden-container" hack (force-mounting `<Retirement/><Budget/>
  <Investments/><Reserve/><Loans/>` off-screen just so each one's own fetch
  effect would run and populate context) is gone; `Home.js` now dispatches
  the load thunks it needs directly. Deleted `AppContext.js`, removed
  `AppProvider` from `index.js`, deleted the orphaned dead
  `loans/loan/VanguardBrokerage.js` found in task 4. Confirmed via grep:
  zero `AppContext`/`useContext` references left anywhere in `ui/src`
  (the only 2 hits are my own explanatory code comments, not code).
- #7 Verify (docker-compose boot + smoke test) — **DONE**. See full results below.

## Verification results (all passed)

**Environment note first** - if you ever `npm install` or `docker compose build`
in `ui/` again from Windows: this machine's WSL distro has **no native Node**
(`node: command not found` in WSL - `npm`/`node` there are Windows binaries via
interop), and Windows/Git-Bash `npm install` against the `\\wsl.localhost\...`
UNC path throws `EISDIR` on `.bin` symlinks. Net effect: **do host-side npm
installs from Windows with `--legacy-peer-deps --no-bin-links`** (already done,
see above), and **do `docker compose build`/`up` by routing through
`wsl.exe -e bash -lc "cd ~/finance-app && docker compose ..."`** rather than
running docker compose directly from Windows/Git-Bash against the UNC path -
plain Windows-side `docker compose build` reliably fails with
`failed to solve: Canceled: context canceled` reading the build context over
that path (confirmed twice). Also added `- /app/node_modules` as an anonymous
volume on the `frontend` service in `docker-compose.yaml`, otherwise the
`./ui:/app` bind mount shadows the container's own (correctly bin-linked)
`node_modules` with the host's `--no-bin-links` copy and the frontend
container crashes with `sh: react-scripts: not found`.

**Frontend build**: `docker compose build` succeeded, webpack compiled with
zero errors ("Compiled with warnings" - only pre-existing `no-unused-vars`
lint warnings, all but 2 of which existed in the original code before this
migration; the 2 new ones, in `Budget.js`, were cleaned up).

**Backend**: booted against the real production database. Curled all 18
restructured route/controller pairs (every simple-CRUD domain, every
month/year-scoped budget endpoint, and the CoinGecko `/crypto-market` proxy) -
every single one returned HTTP 200 with correct real data and generated
correct SQL (checked via server logs).

**Frontend, live in browser**: Home, Retirement, Investments, Reserve, and
Loans pages all render real data with zero console errors (only pre-existing
React Router future-flag warnings and one pre-existing missing-`key`-prop
warning on Home's crypto list). Every displayed total was cross-checked
against the raw API values and matches exactly (e.g. Loans page:
$24,432.42 + $250,735.14 + $9,879.54 = $285,047.10 total, correct to the
cent). This confirms the slice transforms, selectors, and the
"hidden-container" removal on Home.js are all correct.

**Not tested**: any Add/Edit/Delete action (per the agreed read-only
constraint - this is Aaron's real financial data) and the Budget page's
month-scoped view specifically (the `@mui/lab` DatePicker's text input isn't
reachable via browser automation - a pre-existing component quirk untouched
by this migration, not a regression). The Budget page's no-month-selected
default state does render correctly. If you want the month-scoped flow
verified too, select a month yourself in the browser and check that
Income/Fixed Expenses/Monthly Expenses/Distributions/Notes all populate.

### Budget domain migration notes (read before touching Reports/Home)
- **`budgetSlice`** grew during task 5: now also owns `openInstructions`
  (bool) and `budgetRefresh` (bool, toggled via `toggleBudgetRefresh()`).
  `budgetRefresh` exists ONLY to force a same-month reload after
  seed/delete/export - ordinary add/edit/delete on any budget sub-domain
  does NOT need it, because each of those thunks already reloads its own
  slice internally (see task 3's established pattern note).
- **Simplification made**: the original `Budget.js` had a `reason`-string-gated
  giant effect that decided which of ~8 domains to refetch based on which
  child action last fired. That's gone. Replaced with two effects: (1) load
  the 3 master lists (fixedExpenses/fixedIncome/currentBudgetCategories) once
  on mount, (2) on `[date, budgetRefresh]` change, load everything scoped to
  the selected month (or clear it all if `date` is null, via each slice's
  `clearX` action). `reason` itself is still dispatched in a couple of
  "cancel out of new-budget-flow" handlers for parity but nothing reads it
  anymore - harmless dead state, not worth removing right now.
- **`selectBudgetComparison`** (in `helperFunctions.js`) replaced the
  original's two separately-sorted parallel arrays
  (`displayBudgetCategories` + `budgetComparison`, joined by array index -
  a latent footgun if they ever sorted differently). `MonthlyVariedExpenses.js`
  now maps directly over the selector's single array.
- **Incidental bug fix worth knowing about**: the original `AppContext` had
  ONE shared `error` boolean read/written by `EditFixedExpense.js`,
  `EditFixedIncome.js`, and `AddBudgetCategoryModal.js` - three unrelated
  forms - so a duplicate-category error flagged in one could leak into
  another if opened next. Each now has its own local `error` state instead.
- **`AddExpenseModal.js`** used to read `openAddExpense` off `AppContext`
  (inconsistent with every sibling Add*Modal, which take `open`/`setOpen`
  props). Now takes `open`/`setOpen` props from `MonthlyVariedExpenses.js`
  like its siblings.
- `AddDistributionModal`, `AddNoteModal`, `AddIncomeModal` used to refocus
  their input field on the unrelated global `budgetRefresh` counter changing.
  Now they refocus on their own `open` prop changing instead - more correct
  (previously refocused any time ANY budget action fired anywhere), still
  preserves "focus when the dialog appears."

### Found during task 4: dead orphaned file
`ui/src/components/loans/loan/VanguardBrokerage.js` is a stray duplicate of
the real `investmentsNew/vanguard/VanguardBrokerage.js`, still on
`AppContext`, imported by nothing (confirmed via grep across `ui/src`). Left
as-is for now (harmless, not bundled since nothing imports it) - delete it
during task 6's AppContext cleanup pass, otherwise it's left with a broken
import once `AppContext.js` is gone.
- #6 Migrate Reports/Home/Navbar/Snackbar, remove AppContext — **NOT STARTED**
- #7 Verify (docker-compose boot + smoke test) — **NOT STARTED**

### Pattern established in task 3 (replicate exactly for tasks 4-6)
Every domain list component (e.g. `VanguardRetirement.js`) follows this shape now:
- `useSelector((state) => state.<domain>.items)` for rows, no local `rows` state.
- One `useEffect(() => { dispatch(loadX()); }, [dispatch])` on mount - no
  `accountsRefresh` state/prop anywhere (the slice's add/update/remove thunks
  already re-dispatch the load thunk internally after a successful write, see
  e.g. `vanguardRetirementSlice.js`'s `addVanguardRetirement`).
- `AddXButton.js` takes **no props** anymore (used to take
  `endpoint`/`setAccountsRefresh`/`accountsRefresh`) - just local `open` state.
- Add/Edit dialogs: `dispatch(addX(payload)).unwrap().then(() =>
  dispatch(setSnackbarSuccess(true))).catch(() =>
  dispatch(setSnackbarError(true)))`, called synchronously before
  `handleModalClose()` (not awaited - matches the original's fire-and-forget feel).
- Confirm-delete dialogs: same `.unwrap()` pattern, `.finally(() =>
  setCurrentRow({}))` instead of doing it in both branches.
- Row "display" shape (holder/type/return/ytdReturn/etc.) is **not** the same
  as the POST/PATCH payload shape (accountHolder/accountType/totalReturn/...)
  in several domains (vanguardRetirement, tsp, vanguardBrokerage) - this
  split already existed in the original per-component code, it's now baked
  into each slice's `loadX` thunk transform. Check the actual old component
  before assuming payload field names == display field names when migrating
  a domain you haven't looked at yet.
- Cross-component totals (`RetirementSummary.js`, `InvestmentSummary.js`,
  `ReserveSummary.js`) now read `useSelector(selectInvestmentTotals)` from
  `helperFunctions.js` instead of `useContext(AppContext)`.

## What's done

### Backend (task 1) — complete, matches the plan exactly
`server/app.js` and `server/controllers/controllers.js` are deleted. New
layout, all ESM:
- `server/src/app.js` — flat `app.use(...)` mounting, 18 route modules, no `/api` prefix.
- `server/src/routes/*.js` + `server/src/controllers/*.js` — 18 domain pairs (see the plan file's table for the exact domain→route mapping).
- `server/src/controllers/dbConnection.js` — ESM version of the old `controllers/dbConnection.js`.
- `server/knexfile.js` — ESM `export default`.
- All 17 files in `server/migrations/` + the 1 file in `server/seeds/` — converted `exports.up=`/`exports.seed=` to `export async function up/down/seed`.
- `server/package.json` — `"type": "module"`, `"main": "src/app.js"`, start script now `nodemon src/app.js`.
- `server/Dockerfile` — bumped `node:14-alpine` → `node:18-alpine`.

All new backend files passed `node --check` (syntax only — **not** run against
a live DB yet, that's task 7).

Two things flagged, not fixed (per plan, no behavior changes): the legacy
`/data`/`/ticker`/`/transaction`/`/shares` group (now `investmentsLegacyRoutes.js`
+ `investmentsLegacyController.js`) has zero frontend callers and its
`fetchData` is a dead stub that returns `undefined` — preserved as-is.

### Frontend Redux infrastructure (task 2) — code written, **NOT installed, NOT tested**
New files, all following Polyglot's slice/thunk/`extraReducers(builder)` convention:
- `ui/src/utilities/serverCalls.js` — every domain's axios call, centralized (this was the biggest style delta from segla's original inline-axios-per-component code).
- `ui/src/state/*.js` — 17 slices: `vanguardRetirementSlice`, `tspSlice`, `vanguardBrokerageSlice`, `pa529Slice`, `cryptoSlice` (two-stage: DB load + market-data merge, mirrors old `GetCryptoData.js`), `baskSlice`, `loansSlice`, `equitySlice`, `budgetSlice` (also owns `date`/`reason`/`newBudget` as plain reducers — these are cross-component UI state in the original, several components outside `Budget.js` read `date`), `fixedExpensesSlice`, `fixedIncomeSlice`, `monthlyIncomeSlice`, `monthlyExpensesSlice` (holds both fixed-type and varied-type rows, matching the old dual context fields), `budgetCategoriesSlice` (holds both the master list and the per-month snapshot — original had these as two separate context fields off the same underlying `type` distinction), `monthEndDistributionsSlice`, `notesSlice` (includes `exportBudgetCSV` thunk), `reportsSlice`, `uiSlice` (snackbar flags — no direct Polyglot equivalent, follows the same shape anyway).
- `ui/src/state/store.js` — `configureStore` combining all 17 above.
- `ui/src/index.js` — wrapped in `<Provider store={store}>`, **nested outside** the still-present `<AppProvider>` (both providers are active right now, intentionally, so the app keeps working while migration is incremental — see "how to resume").
- `ui/package.json` — added `"@reduxjs/toolkit": "^2.2.7"` and `"react-redux": "^8.1.3"`.
  **Caveat, read this**: segla's `ui` is on **React 17** (`ReactDOM.render`, not `createRoot`). Polyglot uses `react-redux ^9.2.0`, but react-redux 9 requires React 18+. Deliberately pinned to `^8.1.3` here instead — v8 supports React 17. Do **not** blindly copy Polyglot's exact react-redux version into other pre-React-18 projects.

### Update: helperFunctions.js selectors now written too
`ui/src/utilities/helperFunctions.js` exists with `selectInvestmentTotals`,
`selectLoanTotals`, `selectBudgetBalance`, `selectBudgetComparison`. While
writing these, also went back and added field-name transforms (raw
snake_case DB columns → the camelCase names the original components used,
e.g. `current_value`→`value`, `account_holder`→`accountHolder`) to the
`loadX` thunks in `vanguardRetirementSlice`, `tspSlice`,
`vanguardBrokerageSlice`, `pa529Slice`, `baskSlice`, `loansSlice`,
`equitySlice` — these transforms used to live inline in each component
(`Equity.js`, `Loan.js`, etc.); moved them into the thunk so both the
selectors and the eventually-migrated components get consistent field names.
`equitySlice`/`loansSlice` also now compute the same derived fields the
originals did (`equity = valuation - remainingBalance`, loan totals grouped
by `type`).

### Update: `npm install` done
Plain `npm install` fails twice in this environment - first on an npm ERESOLVE
false-positive (react-redux's optional `react-native` peer dep), then on
`EISDIR` writing `.bin` symlinks across the `\\wsl.localhost\...` UNC mount.
The working command, from `ui/`:
```
npm install --legacy-peer-deps --no-bin-links
```
Confirmed `@reduxjs/toolkit` and `react-redux` are actually present in
`node_modules` after this. Use the same flags for any future installs in this
repo from Windows/Git-Bash against the WSL-mounted path. This is the piece that replaces the old "push totals up into AppContext via `useEffect(() => setXTotal(...))`" pattern from `Crypto.js`, `Equity.js`, `Budget.js`, etc. Needs `createSelector` selectors along the lines of (names from the plan):
  - `selectInvestmentTotals` — vanguardRetirement + tsp + vanguardBrokerage + pa529 + crypto + bask + equity's `houseValuationTotal`, feeding `HomeSummary.js`'s `investmentSummary` object.
  - `selectLoanTotals` — mortgage/studentLoan/auto breakdowns from `loansSlice`, feeding `HomeSummary.js`'s `loanSummary`.
  - `selectBudgetBalance` — the big `Budget.js` `getBalance()` effect (spendTotal/incomeTotal/fixedIncomeTotal/monthEndDistributionsTotal/fixedExpensesTotal/remaining) — this is the most complex one, re-derive from `monthlyExpensesSlice` + `monthlyIncomeSlice` + `fixedIncomeSlice` + `fixedExpensesSlice` + `monthEndDistributionsSlice` state instead of local `useState`.
  - `selectBudgetComparison` — the per-category warning/limit comparison effect in `Budget.js`, from `budgetCategoriesSlice.snapshotCategories` + `monthlyExpensesSlice.variedExpenses`.
  Write this file before migrating `HomeSummary.js` or `Budget.js` (tasks 5/6) — components in tasks 3/4 (investments-new, loans, equity) mostly don't need it, they can migrate straight off slice state.

## How to resume

1. Re-read the plan file (`C:\Users\aaron\.claude\plans\clever-hugging-ember.md`) for full context — component migration pattern, execution order, verification plan are all there.
2. `cd finance-app/ui && npm install` (picks up the two new deps) — do this first, before migrating any component, so you can actually run the dev server to check work as you go.
3. Then resume at task #3 (`TaskList` → claim #3) — migrate investments-new domain components (`VanguardRetirement.js`, `TSP.js`, `VanguardBrokerage.js`, `PA529.js`, `Crypto.js`+`GetCryptoData.js`, `Bask.js`, and each domain's `Add*Dialog.js`/`Edit*Dialog.js`/`ConfirmDelete*Dialog.js`) off `useContext(AppContext)` + local `axios`/`useState`/`useEffect` onto `useSelector`/`dispatch`. The slice + serverCalls function names already match each component's existing field names closely (e.g. `Equity.js`'s `endpoint`/`equityRefresh` pattern → `dispatch(loadEquity())`/`dispatch(addEquity(payload))` from `equitySlice`), so this should be mostly mechanical per component.
5. Tasks #4, #5, #6 follow in order (#5 — Budget — is the big one, `Budget.js` itself has 5 interlocking `useEffect`s to unwind; #6 also does the final "delete `AppContext.js`, confirm zero remaining imports" step).
6. Task #7 (verification) last: `docker-compose up` from `finance-app/`, curl each backend domain, then walk every frontend page in-browser per the plan's verification section. **Nothing has been runtime-tested yet** — not the backend against a live DB, not the frontend build, not a single page in a browser. Budget for this.

## Known risk spots to watch during verification
- `notesController.js`'s `windowsDocsPath` (CSV export) reads `process.env.USERPROFILE` — Windows-host-specific path logic, unchanged from original, but worth an explicit check since it's the one function with host-filesystem side effects outside the DB.
- `monthlyExpensesController.js`'s `deleteMonthlyExpenses` migration note: original `20220109173748_create_monthly_expenses.js`'s `down()` drops the wrong table (`"income"` instead of `"monthly_expenses"`) — this is a **pre-existing bug in the original migration file**, preserved verbatim during the ESM conversion per "no behavior changes". Flagging here so it's not mistaken for something introduced during this restructure.

## Post-migration bug fixes (found by user testing, fixed in a follow-up session)

The migration itself (tasks #1-#7 above) was functionally complete, but a fresh
`npm install` run while adding `@reduxjs/toolkit`/`react-redux` silently let
**every caret-range dependency in `ui/package.json` re-resolve to latest**
instead of respecting what was actually locked before (the old `package-lock.json`
got deleted/regenerated along the way). This wasn't one or two stray version
bumps - it was near-total drift: `@mui/material`/`@mui/icons-material`/`@mui/styles`
5.1.1→5.18.0, `date-fns` 2.26.0→2.30.0, `react-router`/`react-router-dom`
6.0.2→6.30.6, `chart.js`, `csv-parse`, `csv-parser`, `@emotion/*`, all bumped too.
Three separate-looking user-reported bugs all traced back to this one root cause
plus two real code bugs the drift happened to unmask:

1. **Crypto summary tile showed "undefined"** - real bug in `cryptoSlice.js`:
   `loadCryptoMarketData` was dispatched with no args right after `loadCrypto`,
   so it read `getState().crypto.items` before `loadCrypto.fulfilled` had
   updated the store - a race, not a dependency issue. Fixed by passing the
   just-fetched items directly as the thunk argument instead of re-reading
   state.

2. **PA529 table footer misaligned** - real bug, pre-existing even before the
   Redux migration (copied verbatim from the original `PA529.js`): the footer
   row had 4 `<TableCell>`s for a 5-column table. Fixed by adding the missing
   empty cell so `Total:`/value/return land under the right columns.

3. **Month selector "not working"** - this was actually two stacked bugs:
   - The `@mui/lab` DatePicker's calendar-grid year/month click crashed the
     whole app with `ReferenceError: process is not defined`, coming from a
     dynamically-loaded webpack chunk. Root cause was the `date-fns` drift
     (2.26.0 → 2.30.0) - not a version anyone touched on purpose, just
     collateral damage from the npm install above.
   - Once the picker didn't crash, `MonthlyIncome.js` and
     `MonthEndDistributions.js` both called `.sort()` directly on the array
     returned by `useSelector`. Redux Toolkit freezes state via Immer in dev
     mode, so mutating it in place (`.sort()` sorts in place) threw
     `TypeError: Cannot assign to read only property '0' of object
     '[object Array]'`, crashing those components - this is why income showed
     $0 even for a month with real data. This exact anti-pattern (mutating a
     selector's return value) doesn't error against plain `useState`/Context,
     which is why it never surfaced before the Redux migration. Fixed both by
     sorting a copy (`[...selectorResult].sort(...)`) instead of the frozen
     array itself. Swept the rest of the app for the same `.sort()`/`.push()`/
     `.splice()`/`.reverse()` pattern against `useSelector` output - no other
     instances found; every other `.sort()` call in the codebase runs on a
     freshly-built local array, which is safe.

**The dependency-drift fix**: rather than pinning each drifted package one at
a time, restored the original pre-migration `ui/package-lock.json` (from the
commit right before the migration, `708d4f0`) into place, then ran
`docker compose build frontend` so `npm install` reused every already-locked
version and only resolved the two genuinely new packages
(`@reduxjs/toolkit`, `react-redux`) against it. Confirmed post-fix that every
previously-drifted package matches the original exactly.
`ui/package.json`'s `@mui/lab` and `date-fns` entries were also changed from
caret (`^`) to exact pins, matching what's now locked, as a safety net against
this happening again on some future `npm install` in this project.

Reminder for next time a new npm package needs adding to `ui/`: never let
`package-lock.json` get deleted/regenerated from scratch - always install
with the existing lockfile in place so npm only resolves what's actually new.
