import knex from "./dbConnection.js";
import { fetchCryptoMarketData } from "./cryptoController.js";

// Calendar day the snapshot belongs to, in the household's timezone rather
// than the server's (the VM/container clock is UTC, so an edit at 9pm
// Eastern would otherwise land on tomorrow's row).
const SNAPSHOT_TZ = process.env.SNAPSHOT_TZ || "America/New_York";

function todayString() {
  // en-CA formats as YYYY-MM-DD
  return new Date().toLocaleDateString("en-CA", { timeZone: SNAPSHOT_TZ });
}

const sumBy = (rows, key) =>
  rows.reduce((total, row) => total + (Number(row[key]) || 0), 0);

const round2 = (value) => Math.round(value * 100) / 100;

// Same id-tag derivation as the UI's cryptoSlice.loadCryptoMarketData.
const toCoinGeckoId = (name) => name.replace(/\s+/g, "-").toLowerCase();

// Crypto value isn't stored anywhere - the UI multiplies shares by a live
// CoinGecko price. Do the same here. If CoinGecko is down or rate-limits
// us, carry forward the last snapshot's crypto value instead of recording
// a fake $0 drop.
async function getCryptoTotal() {
  const holdings = await knex("cryptocurrency").select("name", "shares");
  if (holdings.length === 0) return 0;

  const idTags = holdings.map((h) => toCoinGeckoId(h.name)).join(",");
  const response = await fetchCryptoMarketData(idTags);
  const prices = response?.data;

  if (!prices || typeof prices !== "object" || response instanceof Error) {
    const last = await knex("net_worth_snapshots")
      .select("crypto")
      .orderBy("snapshot_date", "desc")
      .first();
    return last ? Number(last.crypto) : 0;
  }

  return holdings.reduce((total, h) => {
    const price = prices[toCoinGeckoId(h.name)]?.usd || 0;
    return total + (Number(h.shares) || 0) * price;
  }, 0);
}

// Mirrors the UI's selectInvestmentTotals/selectLoanTotals + Home.js math so
// a snapshot matches what the Net Worth card shows.
async function computeNetWorth() {
  const [
    vanguardRetirement,
    tsp,
    vanguardBrokerage,
    pa529,
    bask,
    equity,
    loans,
    crypto,
  ] = await Promise.all([
    knex("vanguard_retirement").select("current_value"),
    knex("tsp").select("current_value"),
    knex("vanguard_brokerage").select("current_value"),
    knex("pa529").select("current_value"),
    knex("bask").select("current_value"),
    knex("equity").select("valuation"),
    knex("loans").select("type", "remaining_balance"),
    getCryptoTotal(),
  ]);

  const loansOfType = (type) =>
    sumBy(loans.filter((l) => l.type === type), "remaining_balance");

  const breakdown = {
    retirement: sumBy(vanguardRetirement, "current_value") + sumBy(tsp, "current_value"),
    brokerage: sumBy(vanguardBrokerage, "current_value"),
    college: sumBy(pa529, "current_value"),
    crypto,
    emergency: sumBy(bask, "current_value"),
    house: sumBy(equity, "valuation"),
    mortgage: loansOfType("Mortgage"),
    student_loan: loansOfType("Student Loan"),
    auto_loan: loansOfType("Auto Loan"),
  };

  const total_assets =
    breakdown.retirement +
    breakdown.brokerage +
    breakdown.college +
    breakdown.crypto +
    breakdown.emergency +
    breakdown.house;
  const total_liabilities =
    breakdown.mortgage + breakdown.student_loan + breakdown.auto_loan;

  const result = {
    ...breakdown,
    total_assets,
    total_liabilities,
    net_worth: total_assets - total_liabilities,
  };
  Object.keys(result).forEach((key) => {
    result[key] = round2(result[key]);
  });
  return result;
}

// pg hands DATE columns back as a JS Date at *server-local* midnight, which
// then serializes to the previous day for anyone west of UTC. Return the
// plain YYYY-MM-DD string instead.
const SNAPSHOT_COLUMNS = [
  "snapshot_id",
  knex.raw("to_char(snapshot_date, 'YYYY-MM-DD') as snapshot_date"),
  "retirement",
  "brokerage",
  "college",
  "crypto",
  "emergency",
  "house",
  "mortgage",
  "student_loan",
  "auto_loan",
  "total_assets",
  "total_liabilities",
  "net_worth",
  "source",
  "updated_at",
];

function getSnapshots() {
  return knex("net_worth_snapshots")
    .select(SNAPSHOT_COLUMNS)
    .orderBy("snapshot_date", "asc");
}

// Captures are serialized through this chain so two edits landing at the
// same moment can't race and have the one that read *older* data finish
// (and win the upsert) last.
let captureQueue = Promise.resolve();

function captureSnapshot(source = "auto") {
  const run = async () => {
    const values = await computeNetWorth();
    const snapshot_date = todayString();
    await knex("net_worth_snapshots")
      .insert({ snapshot_date, source, ...values })
      .onConflict("snapshot_date")
      .merge({ ...values, source, updated_at: knex.fn.now() });
    return knex("net_worth_snapshots")
      .select(SNAPSHOT_COLUMNS)
      .where({ snapshot_date })
      .first();
  };
  const result = captureQueue.then(run, run);
  captureQueue = result.catch(() => {});
  return result;
}

function deleteSnapshot(snapshot_id) {
  return knex("net_worth_snapshots").del().where({ snapshot_id });
}

// Guarantees at least one data point per month even in a month where
// nothing gets edited (so the graph never has holes, and crypto drift still
// gets recorded).
async function ensureMonthlySnapshot() {
  const monthStart = `${todayString().slice(0, 7)}-01`;
  const existing = await knex("net_worth_snapshots")
    .where("snapshot_date", ">=", monthStart)
    .first();
  if (!existing) {
    await captureSnapshot("scheduled");
  }
}

export {
  getSnapshots,
  captureSnapshot,
  deleteSnapshot,
  ensureMonthlySnapshot,
};
