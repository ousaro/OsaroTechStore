import test from "node:test";
import assert from "node:assert/strict";

import { assertApplicationEvent } from "../../../../../src/shared/application/contracts/applicationEventContract.js";

test("application event contract accepts valid event and returns it", () => {
  const event = { id: "evt_1", type: "OrderPlaced", payload: {} };

  assert.equal(assertApplicationEvent(event, { expectedType: "OrderPlaced" }), event);
});

test("application event contract rejects invalid shape or unexpected type", () => {
  assert.throws(() => assertApplicationEvent(null));
  assert.throws(() => assertApplicationEvent({ type: "", payload: {} }));
  assert.throws(() =>
    assertApplicationEvent(
      { type: "PaymentConfirmed", payload: {} },
      { expectedType: "OrderPlaced" }
    )
  );
  assert.throws(() => assertApplicationEvent({ type: "OrderPlaced" }));
});

test("application event contract warns for legacy events without id", () => {
  const originalWarn = console.warn;
  const warnings = [];
  console.warn = (message) => warnings.push(message);

  try {
    assertApplicationEvent({ type: "OrderPlaced", payload: {} });
  } finally {
    console.warn = originalWarn;
  }

  assert.match(warnings[0], /missing an id/);
});
