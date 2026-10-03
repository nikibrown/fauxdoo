import { test } from "node:test";
import assert from "node:assert/strict";
import { buildQuote, type Tool } from "./quote.ts";

// Mirrors the seed migration (drizzle/0002_seed.sql).
const TOOLS: Tool[] = [
  { slug: "tasks", name: "Taskana", replaces: "Asana/Jira/Monday", category: "Project management", perUserCents: 2000, flatCents: 0 },
  { slug: "books", name: "Fastbooks", replaces: "QuickBooks", category: "Accounting", perUserCents: 0, flatCents: 7600 },
  { slug: "shop", name: "Buyify", replaces: "Shopify", category: "eCommerce", perUserCents: 0, flatCents: 7900 },
  { slug: "chat", name: "Slick", replaces: "Slack", category: "Chat", perUserCents: 800, flatCents: 0 },
  { slug: "cms", name: "Siteflow", replaces: "Webflow", category: "CMS", perUserCents: 0, flatCents: 3900 },
  { slug: "crm", name: "Dealforce", replaces: "Salesforce", category: "CRM", perUserCents: 5000, flatCents: 0 },
];
const SUITE = 1200;

test("5 users, all six tools", () => {
  const q = buildQuote(TOOLS, ["tasks", "books", "shop", "chat", "cms", "crm"], 5, SUITE);
  assert.equal(q.currentMonthly, 58400);
  assert.equal(q.suiteMonthly, 6000);
  assert.equal(q.annualSavingsCents, 628800);
  assert.equal(q.lineItems.length, 6);
});

test("1 user, tasks + chat + crm", () => {
  const q = buildQuote(TOOLS, ["tasks", "chat", "crm"], 1, SUITE);
  assert.equal(q.currentMonthly, 7800);
  assert.equal(q.suiteMonthly, 1200);
  assert.equal(q.annualSavingsCents, 79200);
});

test("10 users, books only gives negative savings", () => {
  const q = buildQuote(TOOLS, ["books"], 10, SUITE);
  assert.equal(q.currentMonthly, 7600);
  assert.equal(q.suiteMonthly, 12000);
  assert.equal(q.annualSavingsCents, -52800);
});

test("line items follow catalog order and ignore duplicates and unknown slugs", () => {
  const q = buildQuote(TOOLS, ["crm", "tasks", "tasks", "nope"], 2, SUITE);
  assert.deepEqual(q.lineItems, [
    { slug: "tasks", name: "Taskana", monthlyCents: 4000 },
    { slug: "crm", name: "Dealforce", monthlyCents: 10000 },
  ]);
});
