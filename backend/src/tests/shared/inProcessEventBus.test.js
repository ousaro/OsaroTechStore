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
      payload: { orderId: "order-1" },
    });

    expect(orderPlacedHandler.calledOnceWithExactly({
      type: "OrderPlaced",
      payload: { orderId: "order-1" },
    })).to.equal(true);
  });

  it("allows subscribers to unsubscribe cleanly", async () => {
    const eventBus = createInProcessEventBus();
    const paymentConfirmedHandler = sinon.stub().resolves();
    const unsubscribe = eventBus.subscribe("PaymentConfirmed", paymentConfirmedHandler);

    unsubscribe();
    await eventBus.publish({
      type: "PaymentConfirmed",
      payload: { sessionId: "session-1" },
    });

    expect(paymentConfirmedHandler.called).to.equal(false);
  });
});
