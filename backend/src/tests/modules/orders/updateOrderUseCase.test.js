import { describe, it } from "mocha";
import { expect } from "chai";
import { buildUpdateOrderUseCase } from "../../../modules/orders/application/use-cases/updateOrderUseCase.js";

describe("updateOrderUseCase", () => {
  it("persists a shaped order patch instead of raw updates", async () => {
    let persistedPatch = null;
    const updateOrderUseCase = buildUpdateOrderUseCase({
      orderRepository: {
        isValidId: () => true,
        findByIdAndUpdate: async (_id, patch) => {
          persistedPatch = patch.toPrimitives();
          return { _id: "o1", ...persistedPatch };
        },
      },
    });

    const result = await updateOrderUseCase({
      id: "o1",
      updates: {
        status: "paid",
        totalPrice: 150,
      },
    });

    expect(persistedPatch).to.deep.equal({
      status: "paid",
      totalPrice: 150,
    });
    expect(result).to.deep.equal({
      _id: "o1",
      status: "paid",
      totalPrice: 150,
    });
  });

  it("throws when the order id is invalid", async () => {
    const updateOrderUseCase = buildUpdateOrderUseCase({
      orderRepository: {
        isValidId: () => false,
        findByIdAndUpdate: async () => null,
      },
    });

    try {
      await updateOrderUseCase({ id: "bad-id", updates: { status: "paid" } });
      throw new Error("Expected use case to throw");
    } catch (error) {
      expect(error.message).to.equal("Invalid order ID");
      expect(error.statusCode).to.equal(404);
    }
  });
});
