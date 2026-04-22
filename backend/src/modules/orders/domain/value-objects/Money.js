import { assertPositiveNumber } from "../validation/orderValidation.js";

export const createMoney = (amount) => {
  assertPositiveNumber(amount, "totalPrice must be a positive number");

  return Object.freeze({
    amount,
    toPrimitives() {
      return amount;
    },
    valueOf() {
      return amount;
    },
  });
};
