// Turns a report into a CSV file that opens cleanly in Excel. Amounts are
// plain numbers (1234.56, no "$" or commas) so Excel can add them up.

// Excel needs the byte-order mark to read "–" and other non-ASCII text.
const BYTE_ORDER_MARK = "﻿";

export const csvAmount = (cents) => (cents === null || cents === undefined ? "" : (cents / 100).toFixed(2));

// Quotes a cell only when it has a comma, quote or line break.
const csvCell = (value) => {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

// rows: arrays of cells. The title and subtitle come first, then a blank
// line, then the table.
export function downloadCsv({ fileName, title, subtitle, rows }) {
  const lines = [[title], [subtitle], [], ...rows].map((row) => row.map(csvCell).join(","));
  const blob = new Blob([BYTE_ORDER_MARK + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

// The rows for a StatementTable report (P&L, balance sheet, cash flow).
export function statementCsvRows({ columnLabels, sections, summaryRows }) {
  const hasComparison = columnLabels.length > 1;
  const amounts = (cents, compareCents) =>
    hasComparison ? [csvAmount(cents), csvAmount(compareCents), csvAmount(cents - compareCents)] : [csvAmount(cents)];

  const rows = [["Account", ...columnLabels, ...(hasComparison ? ["Change"] : [])]];
  for (const { title, totalLabel, section } of sections) {
    rows.push([title]);
    for (const row of section.rows) {
      const label = row.accountNumber ? `${row.accountNumber} ${row.name}` : row.name;
      rows.push([label, ...amounts(row.amountCents, row.compareAmountCents)]);
    }
    rows.push([totalLabel, ...amounts(section.totalCents, section.compareTotalCents)]);
  }
  for (const row of summaryRows) {
    rows.push([row.label, ...amounts(row.cents, row.compareCents)]);
  }
  return rows;
}
