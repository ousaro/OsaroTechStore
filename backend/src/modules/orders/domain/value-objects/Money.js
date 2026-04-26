import { assertPositifNumber } from "../../../../shared/infrastructure/assertions";

export const createMoney = (amount) => {
  assertPositifNumber(amount, "amount");

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
