import { describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { createOrdersHttpController } from "../../../modules/orders/adapters/http/ordersHttpController.js";

describe("orders http controller", () => {
  it("returns shaped order payloads without legacy payment internals", async () => {
    const ordersCommandPort = {
      addOrder: sinon.stub().resolves({ _id: "o1" }),
      updateOrder: sinon.stub().resolves({ _id: "o1" }),
      deleteOrder: sinon.stub().resolves({ _id: "o1" }),
    };
    const ordersQueryPort = {
      getAllOrders: sinon.stub().resolves([
        { _id: "o1", paymentReference: "pay_123", paymentStatus: "pending" },
      ]),
      getOrderById: sinon.stub().resolves({ _id: "o1" }),
    };
    const { getAllOrdersHandler } = createOrdersHttpController({
      ordersCommandPort,
      ordersQueryPort,
    });
    const captured = {};
    const res = {
      status(code) {
        captured.statusCode = code;
        return this;
      },
      json(body) {
        captured.body = body;
        return this;
      },
    };

    await getAllOrdersHandler({}, res, (error) => {
      if (error) {
        throw error;
      }
    });

    expect(captured.statusCode).to.equal(200);
    expect(captured.body).to.deep.equal([
      { _id: "o1", paymentReference: "pay_123", paymentStatus: "pending" },
    ]);
    expect("transactionId" in captured.body[0]).to.equal(false);
  });
});
