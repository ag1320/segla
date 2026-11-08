// Calendar dates as 'YYYY-MM-DD' strings, computed in UTC so the server's
// timezone can't shift them.
function dayBefore(isoDate) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

// The same day of the month, months later. A day the later month doesn't
// have (the 31st in June) becomes that month's last day.
function addMonths(isoDate, months) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const target = new Date(Date.UTC(year, month - 1 + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return target.toISOString().slice(0, 10);
}

function daysBetween(fromIsoDate, toIsoDate) {
  return (Date.parse(`${toIsoDate}T00:00:00Z`) - Date.parse(`${fromIsoDate}T00:00:00Z`)) / 86400000;
}

export { dayBefore, addMonths, daysBetween };
