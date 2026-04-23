import { describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { createOrdersCommandPort } from "../../../../src/modules/orders/ports/input/ordersCommandPort.js";
import { createOrdersQueryPort } from "../../../../src/modules/orders/ports/input/ordersQueryPort.js";
import { createOrdersHttpController } from "../../../../src/modules/orders/adapters/http/ordersHttpController.js";

const flushAsyncHandler = () => new Promise((resolve) => setImmediate(resolve));

describe("orders ports contract", () => {
  it("builds a command port with write-side order handlers only", () => {
    const commandPort = createOrdersCommandPort({
      addOrder: () => {},
      updateOrder: () => {},
      deleteOrder: () => {},
    });

    expect(commandPort).to.have.keys(["addOrder", "updateOrder", "deleteOrder"]);
  });

  it("requires the query port to implement order read handlers", () => {
    expect(() => createOrdersQueryPort({})).to.throw(
      "ordersQueryPort must implement getAllOrders"
    );
  });

  it("routes order reads through the query port and writes through the command port", async () => {
    const ordersCommandPort = createOrdersCommandPort({
      addOrder: sinon.stub().resolves({ _id: "o1" }),
      updateOrder: sinon.stub().resolves({ _id: "o1", status: "paid" }),
      deleteOrder: sinon.stub().resolves({ _id: "o1" }),
    });
    const ordersQueryPort = createOrdersQueryPort({
      getAllOrders: sinon.stub().resolves([{ _id: "o1" }]),
      getOrderById: sinon.stub().resolves({ _id: "o1" }),
    });

    const {
      getAllOrdersHandler,
      getOrderByIdHandler,
      addOrderHandler,
      updateOrderHandler,
      deleteOrderHandler,
    } = createOrdersHttpController({
      ordersCommandPort,
      ordersQueryPort,
    });

    const listRes = { status: sinon.stub().returnsThis(), json: sinon.spy() };
    const getRes = { status: sinon.stub().returnsThis(), json: sinon.spy() };
    const addRes = { status: sinon.stub().returnsThis(), json: sinon.spy() };
    const updateRes = { status: sinon.stub().returnsThis(), json: sinon.spy() };
    const deleteRes = { status: sinon.stub().returnsThis(), json: sinon.spy() };
    const next = sinon.spy();

    getAllOrdersHandler({}, listRes, next);
    getOrderByIdHandler({ params: { id: "o1" } }, getRes, next);
    addOrderHandler({ body: { ownerId: "u1" } }, addRes, next);
    updateOrderHandler({ params: { id: "o1" }, body: { status: "paid" } }, updateRes, next);
    deleteOrderHandler({ params: { id: "o1" } }, deleteRes, next);
    await flushAsyncHandler();

    expect(ordersQueryPort.getAllOrders.calledOnce).to.equal(true);
    expect(ordersQueryPort.getOrderById.calledOnceWithExactly({ id: "o1" })).to.equal(true);
    expect(ordersCommandPort.addOrder.calledOnceWithExactly({ ownerId: "u1" })).to.equal(true);
    expect(ordersCommandPort.updateOrder.calledOnceWithExactly({
      id: "o1",
      updates: { status: "paid" },
    })).to.equal(true);
    expect(ordersCommandPort.deleteOrder.calledOnceWithExactly({ id: "o1" })).to.equal(true);
    expect(addRes.status.calledWith(201)).to.equal(true);
    expect(listRes.status.calledWith(200)).to.equal(true);
    expect(getRes.status.calledWith(200)).to.equal(true);
    expect(updateRes.status.calledWith(200)).to.equal(true);
    expect(deleteRes.status.calledWith(200)).to.equal(true);
    expect(next.called).to.equal(false);
  });
});
