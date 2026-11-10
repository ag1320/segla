import { captureSnapshot } from "../controllers/netWorthController.js";

// Every route that feeds into net worth. Any successful write to one of
// these refreshes today's net worth snapshot, so history gets recorded
// "whenever you update it" without having to remember a separate step.
const NET_WORTH_PATHS = new Set([
  "/vanguardRetirement",
  "/tsp",
  "/vanguardBrokerage",
  "/pa529",
  "/crypto",
  "/bask",
  "/loans",
  "/equity",
]);

// Business writes that change its equity at market value: anything that
// posts to the ledger, plus property valuations.
const BUSINESS_EQUITY_PATHS = [
  /^\/business\/journal-entries/,
  /^\/business\/bank-transactions\/\d+\/(journal-entry|transfer)$/,
  /^\/business\/depreciation-postings$/,
  /^\/business\/year-closings$/,
  /^\/business\/leases\/\d+\/deposit-kept$/,
  /^\/business\/properties\/\d+\/(conversion|acquisition|valuations)$/,
  /^\/business\/property-valuations\/\d+$/,
];

const WRITE_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);

const feedsNetWorth = (path) =>
  NET_WORTH_PATHS.has(path) || BUSINESS_EQUITY_PATHS.some((pattern) => pattern.test(path));

function snapshotOnChange(req, res, next) {
  if (WRITE_METHODS.has(req.method) && feedsNetWorth(req.path)) {
    // "finish" fires after the route has sent its response, i.e. after the
    // DB write it was waiting on has completed - so the snapshot reads the
    // new values. Runs in the background; a failed snapshot never fails
    // the edit itself.
    res.on("finish", () => {
      if (res.statusCode < 400) {
        captureSnapshot("auto").catch((err) => {
          // eslint-disable-next-line no-console
          console.error("Net worth snapshot failed:", err);
        });
      }
    });
  }
  next();
}

export { snapshotOnChange };
