const QUOTE = '"';

// Splits CSV text into rows of fields. Handles quoted fields (which may
// contain commas or line breaks), "" as an escaped quote inside a quoted
// field, and Windows line endings. Blank lines are dropped.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === QUOTE && text[i + 1] === QUOTE) {
        field += QUOTE;
        i++;
      } else if (char === QUOTE) {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === QUOTE) {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }
  row.push(field);
  rows.push(row);

  return rows.filter((fields) => fields.some((value) => value.trim() !== ""));
}

export { parseCsv };
