// Single list of the categories that make up net worth. `key` matches both
// the netWorthSlice snapshot fields and selectNetWorthTotals().breakdown,
// so the chart's Asset Mix view and the What Changed panel pick up a new
// category from here automatically.
//
// Adding a whole new account *category* (e.g. a Fidelity page) also needs:
//   server: a column in net_worth_snapshots (new migration) + its sum in
//           netWorthController.computeNetWorth + its route path in
//           middleware/snapshotOnChange.js
//   ui:     its total in selectNetWorthTotals (helperFunctions.js) and
//           transformSnapshot (netWorthSlice.js)
export const NET_WORTH_CATEGORIES = [
  { key: "retirement", label: "Retirement", kind: "asset" },
  { key: "brokerage", label: "Brokerage", kind: "asset" },
  { key: "college", label: "529", kind: "asset" },
  { key: "crypto", label: "Crypto", kind: "asset" },
  { key: "emergency", label: "Emergency Fund", kind: "asset" },
  { key: "house", label: "House", kind: "asset" },
  { key: "mortgage", label: "Mortgage", kind: "liability" },
  { key: "studentLoan", label: "Student Loans", kind: "liability" },
  { key: "autoLoan", label: "Auto Loans", kind: "liability" },
];

export const ASSET_CATEGORIES = NET_WORTH_CATEGORIES.filter((c) => c.kind === "asset");
