import { describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { createInProcessEventBus } from "../../shared/infrastructure/events/createInProcessEventBus.js";

describe("in-process event bus", () => {
  it("publishes events to subscribers of the matching event type", async () => {
    const eventBus = createInProcessEventBus();
    const orderPlacedHandler = sinon.stub().resolves();
    eventBus.subscribe("OrderPlaced", orderPlacedHandler);

    await eventBus.publish({
      type: "OrderPlaced",
      payload: {
        orderId: "order-1",
        ownerId: "user-1",
        status: "pending",
        paymentStatus: "pending",
        paymentReference: "pay_123",
        totalPrice: 100,
      },
    });

    expect(orderPlacedHandler.calledOnceWithExactly({
      type: "OrderPlaced",
      payload: {
        orderId: "order-1",
        ownerId: "user-1",
        status: "pending",
        paymentStatus: "pending",
        paymentReference: "pay_123",
        totalPrice: 100,
      },
    })).to.equal(true);
  });

  it("allows subscribers to unsubscribe cleanly", async () => {
    const eventBus = createInProcessEventBus();
    const paymentConfirmedHandler = sinon.stub().resolves();
    const unsubscribe = eventBus.subscribe("PaymentConfirmed", paymentConfirmedHandler);

    unsubscribe();
    await eventBus.publish({
      type: "PaymentConfirmed",
      payload: {
        paymentReference: "pay_123",
        sessionId: "session-1",
        paymentStatus: "paid",
        eventId: "evt_123",
      },
    });

    expect(paymentConfirmedHandler.called).to.equal(false);
  });

  it("rejects invalid application events before dispatch", async () => {
    const eventBus = createInProcessEventBus();

    try {
      await eventBus.publish({
        type: "PaymentConfirmed",
        payload: {
          sessionId: "session-1",
          paymentStatus: "paid",
        },
      });
      expect.fail("Expected publish to throw");
    } catch (error) {
      expect(error.message).to.equal("event.payload.paymentReference is required");
    }
  });
});
