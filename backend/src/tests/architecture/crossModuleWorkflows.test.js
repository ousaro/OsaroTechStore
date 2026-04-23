import { describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { createInProcessEventBus } from "../../shared/infrastructure/events/createInProcessEventBus.js";
import { registerApplicationWorkflows } from "../../app/registerApplicationWorkflows.js";
import { buildDeleteCategoryUseCase } from "../../modules/categories/application/commands/deleteCategoryUseCase.js";

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
    expect(unsubscribes).to.have.lengthOf(6);
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
      createPaymentFailedTranslator: ({ handlePaymentFailure }) => ({
        publish: (event) =>
          handlePaymentFailure({
            paymentReference:
              event.payload.paymentReference ?? event.payload.sessionId,
            eventId: event.payload.eventId,
          }),
      }),
      handlePaymentFailureHandler: sinon.stub().resolves(),
      createPaymentExpiredTranslator: ({ handlePaymentExpiration }) => ({
        publish: (event) =>
          handlePaymentExpiration({
            paymentReference:
              event.payload.paymentReference ?? event.payload.sessionId,
            eventId: event.payload.eventId,
          }),
      }),
      handlePaymentExpirationHandler: sinon.stub().resolves(),
      createPaymentRefundedTranslator: ({ handlePaymentRefund }) => ({
        publish: (event) =>
          handlePaymentRefund({
            paymentReference:
              event.payload.paymentReference ?? event.payload.sessionId,
            eventId: event.payload.eventId,
          }),
      }),
      handlePaymentRefundHandler: sinon.stub().resolves(),
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
        ownerId: "user-1",
        status: "pending",
        paymentStatus: "pending",
        paymentReference: "pay_123",
        totalPrice: 100,
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
    const handlePaymentFailure = sinon.stub().resolves();
    const handlePaymentExpiration = sinon.stub().resolves();
    const handlePaymentRefund = sinon.stub().resolves();

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
      createPaymentFailedTranslator: ({ handlePaymentFailure }) => ({
        publish: (event) =>
          handlePaymentFailure({
            paymentReference:
              event.payload.paymentReference ?? event.payload.sessionId,
            eventId: event.payload.eventId,
          }),
      }),
      handlePaymentFailureHandler: handlePaymentFailure,
      createPaymentExpiredTranslator: ({ handlePaymentExpiration }) => ({
        publish: (event) =>
          handlePaymentExpiration({
            paymentReference:
              event.payload.paymentReference ?? event.payload.sessionId,
            eventId: event.payload.eventId,
          }),
      }),
      handlePaymentExpirationHandler: handlePaymentExpiration,
      createPaymentRefundedTranslator: ({ handlePaymentRefund }) => ({
        publish: (event) =>
          handlePaymentRefund({
            paymentReference:
              event.payload.paymentReference ?? event.payload.sessionId,
            eventId: event.payload.eventId,
          }),
      }),
      handlePaymentRefundHandler: handlePaymentRefund,
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
    expect(handlePaymentFailure.called).to.equal(false);
    expect(handlePaymentExpiration.called).to.equal(false);
    expect(handlePaymentRefund.called).to.equal(false);
  });

  it("routes PaymentExpired from the application workflow registry into the order payment-expiration handler", async () => {
    const eventBus = createInProcessEventBus();
    const handlePaymentExpiration = sinon.stub().resolves();

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
      confirmOrderPaymentHandler: sinon.stub().resolves(),
      createPaymentFailedTranslator: ({ handlePaymentFailure }) => ({
        publish: (event) =>
          handlePaymentFailure({
            paymentReference:
              event.payload.paymentReference ?? event.payload.sessionId,
            eventId: event.payload.eventId,
          }),
      }),
      handlePaymentFailureHandler: sinon.stub().resolves(),
      createPaymentExpiredTranslator: ({ handlePaymentExpiration }) => ({
        publish: (event) =>
          handlePaymentExpiration({
            paymentReference:
              event.payload.paymentReference ?? event.payload.sessionId,
            eventId: event.payload.eventId,
          }),
      }),
      handlePaymentExpirationHandler: handlePaymentExpiration,
      createPaymentRefundedTranslator: ({ handlePaymentRefund }) => ({
        publish: (event) =>
          handlePaymentRefund({
            paymentReference:
              event.payload.paymentReference ?? event.payload.sessionId,
            eventId: event.payload.eventId,
          }),
      }),
      handlePaymentRefundHandler: sinon.stub().resolves(),
    });

    await eventBus.publish({
      type: "PaymentExpired",
      payload: {
        paymentReference: "pay_123",
        sessionId: "cs_test_123",
        eventId: "evt_test_124",
        paymentStatus: "failed",
      },
    });

    expect(handlePaymentExpiration.calledOnceWithExactly({
      paymentReference: "pay_123",
      eventId: "evt_test_124",
    })).to.equal(true);
  });
});
