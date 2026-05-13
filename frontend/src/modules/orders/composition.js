import { Order } from "./domain/entities/Order.js";
import { OrderEvents } from "./domain/events/OrderEvents.js";
import { assertInputPort } from "../../shared/kernel/assertions/portAssertions.js";

export function createOrdersModule({ orders: repo, sessionStore, eventBus, notify }) {
  const tok = () => sessionStore.get()?.token;

  async function getAllOrders(params = {}) {
    const { ok, data } = await repo.getAll(params, tok());
    return ok ? data.map((r) => new Order(r)) : [];
  }

  async function placeOrder(payload) {
    const { ok, data, error } = await repo.create(payload, tok());
    if (!ok) { notify.error(error || "Order failed"); throw new Error(error); }
    const order = new Order(data);
    eventBus.publish(OrderEvents.placed(order));
    return order;
  }

  async function updateOrder(id, patch) {
    const { ok, data, error } = await repo.update(id, patch, tok());
    if (!ok) { notify.error(error || "Update failed"); throw new Error(error); }
    const order = new Order(data);
    eventBus.publish(OrderEvents.updated(order));
    return order;
  }

  async function deleteOrder(id) {
    const { ok, error } = await repo.delete(id, tok());
    if (!ok) { notify.error(error || "Delete failed"); throw new Error(error); }
  }

  const inputPort = { getAllOrders, placeOrder, updateOrder, deleteOrder };
  assertInputPort("OrdersInputPort", inputPort, ["getAllOrders","placeOrder","updateOrder","deleteOrder"]);
  return inputPort;
}
