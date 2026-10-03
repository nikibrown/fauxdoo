import { test } from "node:test";
import assert from "node:assert/strict";
import { toCsv } from "./csv.ts";

test("writes a header and rows with CRLF line endings", () => {
  assert.equal(toCsv(["a", "b"], [["x", 1], ["y", 2.5]]), "a,b\r\nx,1\r\ny,2.5\r\n");
});

test("quotes cells with commas, quotes, or newlines", () => {
  assert.equal(toCsv(["v"], [['say "hi", ok'], ["two\nlines"]]), 'v\r\n"say ""hi"", ok"\r\n"two\nlines"\r\n');
});

test("neutralizes spreadsheet formulas in text but not numbers", () => {
  assert.equal(toCsv(["v"], [["=HYPERLINK(1)"], ["+1"], ["@x"], ["-y"], [-480]]), "v\r\n'=HYPERLINK(1)\r\n'+1\r\n'@x\r\n'-y\r\n-480\r\n");
});
