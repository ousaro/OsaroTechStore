import { describe, it } from "mocha";
import { expect } from "chai";
import { buildGetOrderByIdUseCase } from "../../../modules/orders/application/use-cases/getOrderByIdUseCase.js";
import { OrderNotFoundError } from "../../../modules/orders/application/errors/OrderApplicationError.js";

describe("getOrderByIdUseCase", () => {
  it("returns the order when the repository finds it", async () => {
    const order = { _id: "507f1f77bcf86cd799439012", status: "pending" };
    const getOrderByIdUseCase = buildGetOrderByIdUseCase({
      orderRepository: {
        isValidId: () => true,
        findById: async () => order,
      },
    });

    const result = await getOrderByIdUseCase({ id: order._id });

    expect(result).to.equal(order);
  });

  it("throws 404 when the order id is invalid", async () => {
    const getOrderByIdUseCase = buildGetOrderByIdUseCase({
      orderRepository: {
        isValidId: () => false,
        findById: async () => null,
      },
    });

    try {
      await getOrderByIdUseCase({ id: "bad-id" });
      throw new Error("Expected use case to throw");
    } catch (error) {
      expect(error).to.be.instanceOf(OrderNotFoundError);
      expect(error.message).to.equal("Invalid order ID");
      expect(error.code).to.equal("ORDER_NOT_FOUND");
    }
  });

  it("throws 404 when the order cannot be found", async () => {
    const getOrderByIdUseCase = buildGetOrderByIdUseCase({
      orderRepository: {
        isValidId: () => true,
        findById: async () => null,
      },
    });

    try {
      await getOrderByIdUseCase({ id: "507f1f77bcf86cd799439012" });
      throw new Error("Expected use case to throw");
    } catch (error) {
      expect(error).to.be.instanceOf(OrderNotFoundError);
      expect(error.message).to.equal("Order not found");
      expect(error.code).to.equal("ORDER_NOT_FOUND");
    }
  });
});
