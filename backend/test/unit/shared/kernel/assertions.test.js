import test from "node:test";
import assert from "node:assert/strict";

import {
  assertArray,
  assertBoolean,
  assertFunction,
  assertNonEmptyArray,
  assertNonEmptyString,
  assertNonNegativeNumber,
  assertObject,
  assertPositiveNumber,
  assertRequiredFields,
} from "../../../../src/shared/kernel/assertions/index.js";

test("assertion helpers accept valid values", () => {
  assert.doesNotThrow(() => assertNonEmptyString("x", "field"));
  assert.doesNotThrow(() => assertObject({}, "field"));
  assert.doesNotThrow(() => assertArray([], "field"));
  assert.doesNotThrow(() => assertNonEmptyArray([1], "field"));
  assert.doesNotThrow(() => assertFunction(() => {}, "field"));
  assert.doesNotThrow(() => assertBoolean(false, "field"));
  assert.doesNotThrow(() => assertPositiveNumber(1, "field"));
  assert.doesNotThrow(() => assertNonNegativeNumber(0, "field"));
  assert.doesNotThrow(() => assertRequiredFields({ a: 1 }, ["a"]));
});

test("assertion helpers reject invalid values", () => {
  assert.throws(() => assertNonEmptyString("", "field"));
  assert.throws(() => assertObject(null, "field"));
  assert.throws(() => assertArray({}, "field"));
  assert.throws(() => assertNonEmptyArray([], "field"));
  assert.throws(() => assertFunction("fn", "field"));
  assert.throws(() => assertBoolean("true", "field"));
  assert.throws(() => assertPositiveNumber(0, "field"));
  assert.throws(() => assertNonNegativeNumber(-1, "field"));
  assert.throws(() => assertRequiredFields({ a: "" }, ["a"]));
});
