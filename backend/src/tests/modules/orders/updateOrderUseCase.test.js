import { describe, it } from "mocha";
import { expect } from "chai";
import { buildUpdateOrderUseCase } from "../../../modules/orders/application/commands/updateOrderUseCase.js";
import { OrderNotFoundError } from "../../../modules/orders/application/errors/OrderApplicationError.js";
import { DomainValidationError } from "../../../shared/domain/errors/DomainValidationError.js";

describe("updateOrderUseCase", () => {
  it("persists a shaped lifecycle patch instead of raw updates", async () => {
    let persistedPatch = null;
    const updateOrderUseCase = buildUpdateOrderUseCase({
      orderRepository: {
        isValidId: () => true,
        findById: async () => ({ _id: "o1", status: "pending", paymentStatus: "pending" }),
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
        paymentStatus: "paid",
      },
    });

    expect(persistedPatch).to.deep.equal({
      status: "paid",
      paymentStatus: "paid",
    });
    expect(result).to.deep.equal({
      _id: "o1",
      status: "paid",
      paymentStatus: "paid",
    });
  });

  it("rejects invalid lifecycle transitions instead of patching status blindly", async () => {
    const updateOrderUseCase = buildUpdateOrderUseCase({
      orderRepository: {
        isValidId: () => true,
        findById: async () => ({ _id: "o1", status: "pending", paymentStatus: "pending" }),
        findByIdAndUpdate: async () => {
          throw new Error("should not update");
        },
      },
    });

    try {
      await updateOrderUseCase({ id: "o1", updates: { status: "delivered" } });
      throw new Error("Expected updateOrderUseCase to throw");
    } catch (error) {
      expect(error).to.be.instanceOf(DomainValidationError);
      expect(error.message).to.equal("Invalid order status transition from pending to delivered");
    }
  });

  it("rejects lifecycle updates when payment state does not satisfy the target status", async () => {
    const updateOrderUseCase = buildUpdateOrderUseCase({
      orderRepository: {
        isValidId: () => true,
        findById: async () => ({ _id: "o1", status: "pending", paymentStatus: "pending" }),
        findByIdAndUpdate: async () => {
          throw new Error("should not update");
        },
      },
    });

    try {
      await updateOrderUseCase({ id: "o1", updates: { status: "paid" } });
      throw new Error("Expected updateOrderUseCase to throw");
    } catch (error) {
      expect(error).to.be.instanceOf(DomainValidationError);
      expect(error.message).to.equal("Order status paid requires paymentStatus paid");
    }
  });

  it("throws when the order id is invalid", async () => {
    const updateOrderUseCase = buildUpdateOrderUseCase({
      orderRepository: {
        isValidId: () => false,
        findById: async () => null,
        findByIdAndUpdate: async () => null,
      },
    });

    try {
      await updateOrderUseCase({ id: "bad-id", updates: { status: "paid" } });
      throw new Error("Expected use case to throw");
    } catch (error) {
      expect(error).to.be.instanceOf(OrderNotFoundError);
      expect(error.message).to.equal("Invalid order ID");
      expect(error.code).to.equal("ORDER_NOT_FOUND");
    }
  });

  it("throws when the current order cannot be found before a status transition", async () => {
    const updateOrderUseCase = buildUpdateOrderUseCase({
      orderRepository: {
        isValidId: () => true,
        findById: async () => null,
        findByIdAndUpdate: async () => null,
      },
    });

    try {
      await updateOrderUseCase({ id: "o1", updates: { status: "paid" } });
      throw new Error("Expected updateOrderUseCase to throw");
    } catch (error) {
      expect(error).to.be.instanceOf(OrderNotFoundError);
      expect(error.message).to.equal("Order not found");
      expect(error.code).to.equal("ORDER_NOT_FOUND");
    }
  });

  it("allows a status change when the lifecycle patch includes a paid payment status", async () => {
    let persistedPatch = null;
    const updateOrderUseCase = buildUpdateOrderUseCase({
      orderRepository: {
        isValidId: () => true,
        findById: async () => ({ _id: "o1", status: "pending", paymentStatus: "pending" }),
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
        paymentStatus: "paid",
      },
    });

    expect(persistedPatch).to.deep.equal({
      status: "paid",
      paymentStatus: "paid",
    });
    expect(result).to.deep.equal({
      _id: "o1",
      status: "paid",
      paymentStatus: "paid",
    });
  });

  it("uses explicit lifecycle behaviors for fulfillment transitions", async () => {
    let persistedPatch = null;
    const updateOrderUseCase = buildUpdateOrderUseCase({
      orderRepository: {
        isValidId: () => true,
        findById: async () => ({ _id: "o1", status: "paid", paymentStatus: "paid" }),
        findByIdAndUpdate: async (_id, patch) => {
          persistedPatch = patch.toPrimitives();
          return { _id: "o1", ...persistedPatch };
        },
      },
    });

    const result = await updateOrderUseCase({
      id: "o1",
      updates: {
        status: "processing",
      },
    });

    expect(persistedPatch).to.deep.equal({
      status: "processing",
    });
    expect(result).to.deep.equal({
      _id: "o1",
      status: "processing",
    });
  });

  it("rejects immutable order fields after placement", async () => {
    const updateOrderUseCase = buildUpdateOrderUseCase({
      orderRepository: {
        isValidId: () => true,
        findById: async () => ({ _id: "o1", status: "pending", paymentStatus: "pending" }),
        findByIdAndUpdate: async () => {
          throw new Error("should not update");
        },
      },
    });

    try {
      await updateOrderUseCase({
        id: "o1",
        updates: { paymentMethod: "cash" },
      });
      throw new Error("Expected updateOrderUseCase to throw");
    } catch (error) {
      expect(error).to.be.instanceOf(DomainValidationError);
      expect(error.message).to.equal("paymentMethod is immutable after order placement");
    }
  });
});
