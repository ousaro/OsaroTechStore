import { describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { buildAddOrderUseCase } from "../../../modules/orders/application/commands/addOrderUseCase.js";
import { DomainValidationError } from "../../../shared/domain/errors/DomainValidationError.js";
import { createOrderPlacedEvent } from "../../../../src/modules/orders/domain/events/OrderPlaced.js";

describe("addOrderUseCase", () => {
  it("creates an order and publishes OrderPlaced", async () => {
    const publish = sinon.stub().resolves();
    const addOrderUseCase = buildAddOrderUseCase({
      orderRepository: {
        create: async () => ({
          _id: "o1",
          ownerId: "u1",
          status: "pending",
          paymentStatus: "pending",
          paymentReference: "tx-1",
          totalPrice: 100,
        }),
      },
      orderEventPublisher: {
        publish,
      },
    });

    const result = await addOrderUseCase({
      ownerId: "u1",
      products: [{ productId: "p1", qty: 1 }],
      totalPrice: 100,
      status: "pending",
      address: {
        city: "Casablanca",
        addressLine: "Street 1",
        postalCode: "20000",
        country: "MA",
      },
      paymentMethod: "card",
      paymentStatus: "pending",
      transactionId: "tx-1",
      paymentDetails: { provider: "stripe" },
    });

    expect(result).to.deep.equal({
      _id: "o1",
      ownerId: "u1",
      status: "pending",
      paymentStatus: "pending",
      paymentReference: "tx-1",
      totalPrice: 100,
    });
    expect(publish.calledOnceWithExactly({
      type: "OrderPlaced",
      payload: {
        orderId: "o1",
        ownerId: "u1",
        status: "pending",
        paymentStatus: "pending",
        paymentReference: "tx-1",
        totalPrice: 100,
      },
    })).to.equal(true);
  });

  it("creates an OrderPlaced domain event with stable payload", () => {
    const event = createOrderPlacedEvent({
      _id: "o1",
      ownerId: "u1",
      status: "pending",
      paymentStatus: "pending",
      paymentReference: "pay_123",
      totalPrice: 100,
    });

    expect(event).to.deep.equal({
      type: "OrderPlaced",
      payload: {
        orderId: "o1",
        ownerId: "u1",
        status: "pending",
        paymentStatus: "pending",
        paymentReference: "pay_123",
        totalPrice: 100,
      },
    });
  });

  it("requires an order id when creating OrderPlaced", () => {
    expect(() =>
      createOrderPlacedEvent({
        ownerId: "u1",
        status: "pending",
        paymentStatus: "pending",
        totalPrice: 100,
      })
    ).to.throw(DomainValidationError, "order id is required to create OrderPlaced");
  });

  it("prefers the payments-owned reference when paymentDetails provides one", async () => {
    let createdOrder = null;
    const addOrderUseCase = buildAddOrderUseCase({
      orderRepository: {
        create: async (order) => {
          createdOrder = order.toPrimitives();
          return { _id: "o1", ...createdOrder };
        },
      },
    });

    await addOrderUseCase({
      ownerId: "u1",
      products: [{ productId: "p1", qty: 1 }],
      totalPrice: 100,
      status: "pending",
      address: {
        city: "Casablanca",
        addressLine: "Street 1",
        postalCode: "20000",
        country: "MA",
      },
      paymentMethod: "card",
      paymentStatus: "pending",
      transactionId: "pi_provider_123",
      paymentDetails: {
        provider: "stripe",
        paymentReference: "pay_123",
      },
    });

    expect(createdOrder.transactionId).to.equal("pay_123");
    expect(createdOrder.paymentReference).to.equal("pay_123");
    expect(createdOrder.paymentDetails).to.deep.equal({
      paymentReference: "pay_123",
    });
  });
});
