import { test } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import {
  apiError,
  readJson,
  sameOrigin,
  AccessError,
} from "../lib/request-security";
import { contentSecurityPolicy } from "../lib/browser-security";
test("origin checks reject missing and external origins", () => {
  for (const origin of [undefined, "https://attacker.invalid"]) {
    assert.throws(
      () =>
        sameOrigin(
          new Request("https://shop.invalid/api/account", {
            headers: origin ? { origin } : {},
          }),
        ),
      AccessError,
    );
  }
  sameOrigin(
    new Request("https://shop.invalid/api/account", {
      headers: { origin: "https://shop.invalid" },
    }),
  );
});
test("JSON body limits apply even without a Content-Length header", async () => {
  const request = (body: string) =>
    new Request("https://shop.invalid/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
  assert.deepEqual(await readJson(request('{"action":"login"}')), {
    action: "login",
  });
  await assert.rejects(
    readJson(request("x".repeat(20)), 10),
    (e: unknown) => e instanceof AccessError && e.status === 413,
  );
  await assert.rejects(
    readJson(request("{")),
    (e: unknown) => e instanceof AccessError && e.status === 400,
  );
});
test("errors never expose SQL details or user supplied validation values", async () => {
  const secret = "postgres password secret and private email";
  assert.equal(apiError(new Error(secret)).status, 500);
  assert.ok(!(await apiError(new Error(secret)).text()).includes(secret));
  const parsed = z.string().min(50).safeParse(secret);
  assert.ok(!parsed.success);
  if (!parsed.success) assert.equal(apiError(parsed.error).status, 400);
  assert.equal(apiError(new AccessError("Sign in first", 401)).status, 401);
});
test("production CSP trusts only nonce scripts and excludes development eval", () => {
  const csp = contentSecurityPolicy(
    "unique-nonce",
    "https://project.supabase.co",
  );
  assert.match(csp, /script-src 'self' 'nonce-unique-nonce' 'strict-dynamic'/);
  assert.ok(!csp.includes("unsafe-eval"));
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /https:\/\/project.supabase.co/);
  assert.match(
    contentSecurityPolicy("other", "https://project.supabase.co", true),
    /unsafe-eval/,
  );
});

test("database quota rejection maps to retryable HTTP 429", async () => {
  const response = apiError(
    new Error("Too many review requests. Please try again later."),
  );
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("Retry-After"), "60");
});
