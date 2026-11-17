import assert from "node:assert/strict";
import { test } from "node:test";
import { paymentIds, paymentMethods } from "../lib/checkout/payment-methods";
test("checkout keeps BNPL providers distinct and only enables the real COD flow", () => {
  assert.equal(new Set(paymentIds).size, 5);
  assert.ok(paymentIds.includes("koko") && paymentIds.includes("mintpay"));
  assert.deepEqual(
    paymentMethods.filter((p) => p.enabled).map((p) => p.id),
    ["cod"],
  );
  assert.equal(
    paymentMethods.find((p) => p.id === "koko")?.cta,
    "Continue with Koko",
  );
  assert.equal(
    paymentMethods.find((p) => p.id === "mintpay")?.cta,
    "Continue with MintPay",
  );
});
