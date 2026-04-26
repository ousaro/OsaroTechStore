import { describe, it } from "mocha";
import { expect } from "chai";
import { toOrderRecord } from "../../modules/orders/adapters/output/persistence/mongo/orderRecordMapper.js";
import { toOrderReadModel } from "../../modules/orders/application/read-models/orderReadModel.js";
import { toUserReadModel } from "../../modules/users/application/read-models/userReadModel.js";
import { toPaymentReadModel } from "../../modules/payments/application/read-models/paymentReadModel.js";
import { toCategoryReadModel } from "../../modules/categories/application/read-models/categoryReadModel.js";

describe("boundary regression contracts", () => {
  it("keeps orders mapped and exposed through paymentReference only", () => {
    const record = toOrderRecord({
      _id: "o1",
      ownerId: "u1",
      products: [{ productId: "p1", qty: 1 }],
      totalPrice: 100,
      status: "pending",
      address: { city: "Casablanca" },
      paymentMethod: "card",
      paymentStatus: "pending",
      paymentReference: "pay_123",
      transactionId: "legacy_tx_123",
      paymentDetails: { id: "pi_123" },
    });

    const readModel = toOrderReadModel({
      ...record,
      transactionId: "legacy_tx_123",
      paymentDetails: { id: "pi_123" },
    });

    expect(record).to.deep.equal({
      _id: "o1",
      ownerId: "u1",
      products: [{ productId: "p1", qty: 1 }],
      totalPrice: 100,
      status: "pending",
      address: { city: "Casablanca" },
      paymentMethod: "card",
      paymentStatus: "pending",
      paymentReference: "pay_123",
    });
    expect("transactionId" in readModel).to.equal(false);
    expect("paymentDetails" in readModel).to.equal(false);
    expect(readModel.paymentReference).to.equal("pay_123");
  });

  it("keeps user read models free of credential fields", () => {
    const readModel = toUserReadModel({
      _id: "u1",
      firstName: "Jane",
      email: "jane@example.com",
      admin: false,
      password: "hashed",
    });

    expect(readModel).to.deep.equal({
      _id: "u1",
      firstName: "Jane",
      email: "jane@example.com",
      admin: false,
    });
    expect("password" in readModel).to.equal(false);
  });

  it("keeps payment read models provider-neutral while retaining workflow metadata", () => {
    const readModel = toPaymentReadModel({
      id: "cs_123",
      paymentReference: "pay_123",
      orderId: "o1",
      url: "https://checkout.test",
      provider: "stripe",
      workflowType: "redirect_session",
      paymentStatus: "paid",
      providerPaymentId: "pi_123",
      providerStatus: "paid",
      lastWebhookEventId: "evt_123",
    });

    expect(readModel).to.deep.equal({
      id: "cs_123",
      paymentReference: "pay_123",
      orderId: "o1",
      url: "https://checkout.test",
      provider: "stripe",
      workflowType: "redirect_session",
      paymentStatus: "paid",
    });
    expect("providerPaymentId" in readModel).to.equal(false);
    expect("providerStatus" in readModel).to.equal(false);
    expect("lastWebhookEventId" in readModel).to.equal(false);
  });

  it("keeps category description in the stable read model contract", () => {
    expect(
      toCategoryReadModel({
        _id: "c1",
        name: "Phones",
        description: "Smartphones and accessories",
      })
    ).to.deep.equal({
      _id: "c1",
      name: "Phones",
      description: "Smartphones and accessories",
    });
  });
});
