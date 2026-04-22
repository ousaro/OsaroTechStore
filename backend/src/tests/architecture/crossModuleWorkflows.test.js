import { describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { createInProcessEventBus } from "../../shared/infrastructure/events/createInProcessEventBus.js";
import { registerApplicationWorkflows } from "../../app/registerApplicationWorkflows.js";
import { buildDeleteCategoryUseCase } from "../../modules/categories/application/use-cases/deleteCategoryUseCase.js";

describe("cross-module workflows", () => {
  it("registers CategoryDeleted workflow subscriptions in the application workflow registry", async () => {
    const eventBus = createInProcessEventBus();
    const removeProductsByCategory = sinon.stub().resolves();
    const createCategoryDeletedTranslator = sinon.spy(({ removeProductsByCategory }) => ({
      publish: (event) => removeProductsByCategory({ categoryId: event.payload.categoryId }),
    }));

    const unsubscribes = registerApplicationWorkflows({
      eventBus,
      createCategoryDeletedTranslator,
      removeProductsByCategoryHandler: removeProductsByCategory,
    });

    const deleteCategoryUseCase = buildDeleteCategoryUseCase({
      categoryRepository: {
        findByIdAndDelete: async () => ({
          _id: "cat-1",
          name: "Phones",
        }),
      },
      categoryEventPublisher: eventBus,
    });

    const deletedCategory = await deleteCategoryUseCase({ id: "cat-1" });

    expect(deletedCategory).to.deep.equal({
      _id: "cat-1",
      name: "Phones",
    });
    expect(unsubscribes).to.have.lengthOf(3);
    expect(createCategoryDeletedTranslator.calledOnce).to.equal(true);
    expect(removeProductsByCategory.calledOnceWithExactly({
      categoryId: "cat-1",
    })).to.equal(true);
  });

  it("routes OrderPlaced from the application workflow registry into payment linking", async () => {
    const eventBus = createInProcessEventBus();
    const linkPaymentToOrder = sinon.stub().resolves();

    registerApplicationWorkflows({
      eventBus,
      createCategoryDeletedTranslator: ({ removeProductsByCategory }) => ({
        publish: (event) =>
          removeProductsByCategory({ categoryId: event.payload.categoryId }),
      }),
      removeProductsByCategoryHandler: sinon.stub().resolves(),
      createOrderPlacedTranslator: ({ linkPaymentToOrder }) => ({
        publish: (event) =>
          linkPaymentToOrder({
            paymentReference: event.payload.paymentReference,
            orderId: event.payload.orderId,
          }),
      }),
      linkPaymentToOrderHandler: linkPaymentToOrder,
      createPaymentConfirmedTranslator: ({ confirmOrderPayment }) => ({
        publish: (event) =>
          confirmOrderPayment({
            paymentReference:
              event.payload.paymentReference ?? event.payload.sessionId,
            eventId: event.payload.eventId,
          }),
      }),
      confirmOrderPaymentHandler: sinon.stub().resolves(),
    });

    await eventBus.publish({
      type: "OrderPlaced",
      payload: {
        orderId: "order-1",
        paymentReference: "pay_123",
      },
    });

    expect(linkPaymentToOrder.calledOnceWithExactly({
      paymentReference: "pay_123",
      orderId: "order-1",
    })).to.equal(true);
  });

  it("routes PaymentConfirmed from the application workflow registry into the order payment handler", async () => {
    const eventBus = createInProcessEventBus();
    const confirmOrderPayment = sinon.stub().resolves();

    registerApplicationWorkflows({
      eventBus,
      createCategoryDeletedTranslator: ({ removeProductsByCategory }) => ({
        publish: (event) =>
          removeProductsByCategory({ categoryId: event.payload.categoryId }),
      }),
      removeProductsByCategoryHandler: sinon.stub().resolves(),
      createOrderPlacedTranslator: ({ linkPaymentToOrder }) => ({
        publish: (event) =>
          linkPaymentToOrder({
            paymentReference: event.payload.paymentReference,
            orderId: event.payload.orderId,
          }),
      }),
      linkPaymentToOrderHandler: sinon.stub().resolves(),
      createPaymentConfirmedTranslator: ({ confirmOrderPayment }) => ({
        publish: (event) =>
          confirmOrderPayment({
            paymentReference:
              event.payload.paymentReference ?? event.payload.sessionId,
            eventId: event.payload.eventId,
          }),
      }),
      confirmOrderPaymentHandler: confirmOrderPayment,
    });

    await eventBus.publish({
      type: "PaymentConfirmed",
      payload: {
        paymentReference: "pay_123",
        sessionId: "cs_test_123",
        eventId: "evt_test_123",
        paymentStatus: "paid",
      },
    });

    expect(confirmOrderPayment.calledOnceWithExactly({
      paymentReference: "pay_123",
      eventId: "evt_test_123",
    })).to.equal(true);
  });
});
