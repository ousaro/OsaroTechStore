import { assertApplicationEvent } from "../../../../../shared/application/contracts/applicationEventContract.js";
import { assertFunction } from "../../../../../shared/kernel/assertions/index.js";

export const createOrderPlacedStockTranslator = ({ decrementStock }) => {
  assertFunction(
    decrementStock,
    "decrementStock",
    "createOrderPlacedStockTranslator: decrementStock must be a function"
  );

  return {
    async publish(event) {
      assertApplicationEvent(event, { expectedType: "OrderPlaced" });
      const { orderLines } = event.payload;
      if (!orderLines || orderLines.length === 0) return;
      await decrementStock({
        items: orderLines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
        })),
      });
    },
  };
};
