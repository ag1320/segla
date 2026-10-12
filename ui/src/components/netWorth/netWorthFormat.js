// Formatting shared by the Net Worth page and the Home card.

export const formatCurrency = (value) =>
  (Number(value) || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// $1.2M / $350K / $900 - for axis ticks and tight mobile layouts
export const formatCompact = (value) => {
  const n = Number(value) || 0;
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(abs >= 1e7 ? 1 : 2)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(abs >= 1e5 ? 0 : 1)}K`;
  return `${sign}$${abs.toFixed(0)}`;
};

// +$1,234.56 / -$1,234.56
export const formatSigned = (value, compact = false) => {
  const n = Number(value) || 0;
  const body = compact ? formatCompact(Math.abs(n)) : formatCurrency(Math.abs(n));
  return `${n < 0 ? "-" : "+"}${body}`;
};

// Snapshot dates are plain "YYYY-MM-DD" strings. `new Date("2026-10-11")`
// would parse that as UTC midnight (i.e. the evening before, in the US),
// so build a local date instead.
export const parseDate = (dateString) => {
  const [y, m, d] = dateString.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const formatDate = (dateString, options = { month: "short", day: "numeric", year: "numeric" }) =>
  parseDate(dateString).toLocaleDateString("en-US", options);

export const POSITIVE_COLOR = "#56E39F";
export const NEGATIVE_COLOR = "#f95d6a";
export const changeColor = (value) => (value < 0 ? NEGATIVE_COLOR : POSITIVE_COLOR);
