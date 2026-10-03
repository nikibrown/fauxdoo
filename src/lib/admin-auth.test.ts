import { test } from "node:test";
import assert from "node:assert/strict";
import { bearerToken, checkAdminAuth, getAdminToken, tokensMatch } from "./admin-auth.ts";

const request = (authorization?: string) =>
  new Request("http://localhost/api/admin/pricing", {
    headers: authorization ? { Authorization: authorization } : {},
  });

test("parses bearer tokens", () => {
  assert.equal(bearerToken("Bearer abc123"), "abc123");
  assert.equal(bearerToken("bearer abc123"), "abc123");
  assert.equal(bearerToken("Basic abc123"), null);
  assert.equal(bearerToken("Bearer "), null);
  assert.equal(bearerToken("Bearer a b"), null);
  assert.equal(bearerToken(null), null);
});

test("compares tokens", async () => {
  assert.equal(await tokensMatch("secret", "secret"), true);
  assert.equal(await tokensMatch("secret", "secreT"), false);
  assert.equal(await tokensMatch("secret", "secret-longer"), false);
});

test("fails closed when ADMIN_TOKEN is not configured", async () => {
  assert.equal((await checkAdminAuth(request("Bearer anything"), undefined))?.status, 503);
  assert.equal((await checkAdminAuth(request("Bearer "), ""))?.status, 503);
});

test("rejects missing or wrong tokens and accepts the right one", async () => {
  assert.equal((await checkAdminAuth(request(), "secret"))?.status, 401);
  assert.equal((await checkAdminAuth(request("Bearer wrong"), "secret"))?.status, 401);
  assert.equal(await checkAdminAuth(request("Bearer secret"), "secret"), null);
});

test("reads ADMIN_TOKEN from the Cloudflare env, falling back to process.env", () => {
  const previous = process.env.ADMIN_TOKEN;
  try {
    delete process.env.ADMIN_TOKEN;
    assert.equal(getAdminToken({ ADMIN_TOKEN: "from-env" }), "from-env");
    assert.equal(getAdminToken({}), undefined);
    process.env.ADMIN_TOKEN = "from-process";
    assert.equal(getAdminToken({}), "from-process");
    assert.equal(getAdminToken({ ADMIN_TOKEN: "from-env" }), "from-env");
  } finally {
    if (previous === undefined) delete process.env.ADMIN_TOKEN;
    else process.env.ADMIN_TOKEN = previous;
  }
});
