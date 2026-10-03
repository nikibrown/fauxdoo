import { test } from "node:test";
import assert from "node:assert/strict";
import { isHoneypotFilled, validateLead } from "./leads.ts";

const SLUGS = new Set(["tasks", "books", "shop", "chat", "cms", "crm"]);
const VALID = { email: "Test@Example.com ", users: 5, toolSlugs: ["tasks", "chat"], consent: true, website: "" };

test("accepts a valid lead and normalizes email and slugs", () => {
  const result = validateLead({ ...VALID, toolSlugs: ["chat", "tasks", "chat"] }, SLUGS);
  assert.deepEqual(result, {
    ok: true,
    lead: { email: "test@example.com", users: 5, toolSlugs: ["chat", "tasks"] },
  });
});

test("rejects bad input", () => {
  const cases: Record<string, unknown> = {
    "non-object body": [],
    "missing email": { ...VALID, email: undefined },
    "bad email": { ...VALID, email: "not-an-email" },
    "too-long email": { ...VALID, email: `${"a".repeat(250)}@example.com` },
    "zero users": { ...VALID, users: 0 },
    "too many users": { ...VALID, users: 501 },
    "fractional users": { ...VALID, users: 2.5 },
    "string users": { ...VALID, users: "5" },
    "empty tools": { ...VALID, toolSlugs: [] },
    "unknown tool": { ...VALID, toolSlugs: ["tasks", "nope"] },
    "missing consent": { ...VALID, consent: undefined },
    "consent not true": { ...VALID, consent: "yes" },
  };
  for (const [name, body] of Object.entries(cases)) {
    assert.equal(validateLead(body, SLUGS).ok, false, name);
  }
});

test("accepts users at the 1 and 500 boundaries", () => {
  assert.equal(validateLead({ ...VALID, users: 1 }, SLUGS).ok, true);
  assert.equal(validateLead({ ...VALID, users: 500 }, SLUGS).ok, true);
});

test("detects a filled honeypot", () => {
  assert.equal(isHoneypotFilled(VALID), false);
  assert.equal(isHoneypotFilled({ ...VALID, website: undefined }), false);
  assert.equal(isHoneypotFilled({ ...VALID, website: "   " }), false);
  assert.equal(isHoneypotFilled({ ...VALID, website: "https://spam.example" }), true);
  assert.equal(isHoneypotFilled({ ...VALID, website: 1 }), true);
});
