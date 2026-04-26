import { assertPositifNumber, assertNonEmptyString, assertNonEmptyArray, assertObject } from "../../../../shared/infrastructure/assertions/index.js";



export const createOrderLine = (line) => {
  assertObject(line, "orderLine")

  const { productId, qty, ...rest } = line;

  assertNonEmptyString(productId, "productId")

  assertPositifNumber(qty, "orderLine.qty");

  const props = {
    ...rest,
    productId: productId.trim(),
    qty,
  };

  return Object.freeze({
    ...props,
    toPrimitives() {
      return { ...props };
    },
  });
};

export const createOrderLines = (lines) => {
  assertNonEmptyArray(lines, "products")

  return Object.freeze(lines.map((line) => createOrderLine(line)));
};
