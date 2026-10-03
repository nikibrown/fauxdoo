import { test } from "node:test";
import assert from "node:assert/strict";
import { validatePricingUpdate } from "./pricing-update.ts";

const SLUGS = new Set(["tasks", "books", "shop", "chat", "cms", "crm"]);

test("accepts a valid update and trims names", () => {
  const result = validatePricingUpdate(
    {
      suitePerUserCents: 1500,
      tools: [
        { slug: "chat", perUserCents: 900, name: " Slick Pro " },
        { slug: "crm", active: false, sortOrder: 0, flatCents: 0 },
      ],
    },
    SLUGS
  );
  assert.deepEqual(result, {
    ok: true,
    update: {
      suitePerUserCents: 1500,
      tools: [
        { slug: "chat", perUserCents: 900, name: "Slick Pro" },
        { slug: "crm", active: false, sortOrder: 0, flatCents: 0 },
      ],
    },
  });
});

test("accepts a suite-only or tools-only update", () => {
  assert.deepEqual(validatePricingUpdate({ suitePerUserCents: 0 }, SLUGS), {
    ok: true,
    update: { suitePerUserCents: 0, tools: [] },
  });
  assert.equal(validatePricingUpdate({ tools: [{ slug: "tasks", flatCents: 100 }] }, SLUGS).ok, true);
});

test("rejects bad input", () => {
  const cases: Record<string, unknown> = {
    "non-object": [],
    "empty object": {},
    "negative suite": { suitePerUserCents: -1 },
    "fractional suite": { suitePerUserCents: 12.5 },
    "string suite": { suitePerUserCents: "1200" },
    "tools not array": { tools: { slug: "tasks" } },
    "unknown slug": { tools: [{ slug: "nope", flatCents: 1 }] },
    "duplicate slug": { tools: [{ slug: "tasks", flatCents: 1 }, { slug: "tasks", flatCents: 2 }] },
    "negative price": { tools: [{ slug: "tasks", perUserCents: -100 }] },
    "huge price": { tools: [{ slug: "tasks", flatCents: 100_000_001 }] },
    "empty name": { tools: [{ slug: "tasks", name: "  " }] },
    "string active": { tools: [{ slug: "tasks", active: "yes" }] },
    "negative sortOrder": { tools: [{ slug: "tasks", sortOrder: -1 }] },
  };
  for (const [name, body] of Object.entries(cases)) {
    assert.equal(validatePricingUpdate(body, SLUGS).ok, false, name);
  }
});
