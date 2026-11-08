// Date math for report periods. Dates are 'YYYY-MM-DD' strings, built in
// the browser's own timezone like todayDateString().

const toIso = (date) => date.toLocaleDateString("en-CA");
const parts = (isoDate) => isoDate.split("-").map(Number);
// Day 0 of the next month is the last day of this one.
const lastDayOf = (year, monthIndex) => new Date(year, monthIndex + 1, 0);

export const PERIOD_PRESETS = {
  thisMonth: "This month",
  lastMonth: "Last month",
  yearToDate: "Year to date",
  lastYear: "Last year",
  custom: "Custom",
};

// { from, to } for a preset, relative to today.
export function presetPeriod(preset) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  switch (preset) {
    case "thisMonth":
      return { from: toIso(new Date(year, month, 1)), to: toIso(lastDayOf(year, month)) };
    case "lastMonth":
      return { from: toIso(new Date(year, month - 1, 1)), to: toIso(lastDayOf(year, month - 1)) };
    case "lastYear":
      return { from: `${year - 1}-01-01`, to: `${year - 1}-12-31` };
    default:
      return { from: `${year}-01-01`, to: toIso(today) };
  }
}

export const PERIOD_COMPARISONS = {
  none: "No comparison",
  previous: "Previous period",
  lastYear: "Same period last year",
};

// { compareFrom, compareTo } for a P&L period, or {} for no comparison.
// "previous" is the same number of whole months just before, or the same
// number of days when the period isn't whole months.
export function comparisonPeriod({ from, to }, comparison) {
  if (comparison === "lastYear") {
    return { compareFrom: sameDayLastYear(from), compareTo: sameDayLastYear(to) };
  }
  if (comparison !== "previous") return {};

  const [fromYear, fromMonth, fromDay] = parts(from);
  const [toYear, toMonth, toDay] = parts(to);
  const isWholeMonths = fromDay === 1 && toDay === lastDayOf(toYear, toMonth - 1).getDate();
  if (isWholeMonths) {
    const monthCount = (toYear - fromYear) * 12 + (toMonth - fromMonth) + 1;
    return {
      compareFrom: toIso(new Date(fromYear, fromMonth - 1 - monthCount, 1)),
      compareTo: toIso(lastDayOf(toYear, toMonth - 1 - monthCount)),
    };
  }
  const dayCount = Math.round((new Date(toYear, toMonth - 1, toDay) - new Date(fromYear, fromMonth - 1, fromDay)) / 86400000) + 1;
  return {
    compareFrom: toIso(new Date(fromYear, fromMonth - 1, fromDay - dayCount)),
    compareTo: toIso(new Date(fromYear, fromMonth - 1, fromDay - 1)),
  };
}

export const DATE_COMPARISONS = {
  none: "No comparison",
  monthEnd: "End of previous month",
  yearEnd: "End of last year",
};

// The balance sheet's comparison date, or undefined for none.
export function comparisonDate(asOfDate, comparison) {
  const [year, month] = parts(asOfDate);
  if (comparison === "monthEnd") return toIso(lastDayOf(year, month - 2));
  if (comparison === "yearEnd") return `${year - 1}-12-31`;
  return undefined;
}

// Feb 29 becomes Feb 28.
function sameDayLastYear(isoDate) {
  const [year, month, day] = parts(isoDate);
  const lastDay = lastDayOf(year - 1, month - 1).getDate();
  return toIso(new Date(year - 1, month - 1, Math.min(day, lastDay)));
}
