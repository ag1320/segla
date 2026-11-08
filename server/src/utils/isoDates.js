// Calendar dates as 'YYYY-MM-DD' strings, computed in UTC so the server's
// timezone can't shift them.
function dayBefore(isoDate) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

export { dayBefore };
