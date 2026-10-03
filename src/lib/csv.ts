/**
 * Minimal CSV writer (RFC 4180 quoting). Text cells that a spreadsheet
 * would treat as a formula (starting with = + - @ or a tab/CR) are
 * prefixed with an apostrophe, since emails are visitor-supplied.
 * Numbers are written as-is, so negative savings stay numeric.
 */

export type CsvCell = string | number;

function escapeCell(cell: CsvCell): string {
  let text = String(cell);
  if (typeof cell === "string" && /^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(header: string[], rows: CsvCell[][]): string {
  return [header, ...rows].map((row) => row.map(escapeCell).join(",")).join("\r\n") + "\r\n";
}
