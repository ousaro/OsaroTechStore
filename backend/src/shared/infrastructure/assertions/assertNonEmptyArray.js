import { assertArray } from "./";

export const assertNonEmptyArray = (value, fieldName) => {
  assertArray(value,fieldName)
  if (value.length === 0) {
    throw new Error(`Expected a non-empty array`)
  }
}