import { asyncHandler } from "../../../../../shared/infrastructure/http/middleware/asyncHandler.js";
import { assertOrdersInputPort } from "../../../ports/input/ordersInputPort.js";

export const createOrdersHttpController = ({ ordersInputPort }) => {
  assertOrdersInputPort(ordersInputPort);

  return {
    getAllOrders: asyncHandler(async (req, res) => {
      const orders = await ordersInputPort.getAllOrders({ ownerId: req.query.ownerId });
      res.status(200).json(orders);
    }),

    getOrderById: asyncHandler(async (req, res) => {
      const order = await ordersInputPort.getOrderById({ id: req.params.id });
      res.status(200).json(order);
    }),

    addOrder: asyncHandler(async (req, res) => {
      const order = await ordersInputPort.addOrder({
        ownerId: req.user._id,
        orderLines: req.body.orderLines,
        deliveryAddress: req.body.deliveryAddress,
        currency: req.body.currency ?? "USD",
      });
      res.status(201).json(order);
    }),

    updateOrder: asyncHandler(async (req, res) => {
      const order = await ordersInputPort.updateOrder({
        id: req.params.id,
        updates: req.body,
      });
      res.status(200).json(order);
    }),

    deleteOrder: asyncHandler(async (req, res) => {
      const order = await ordersInputPort.deleteOrder({ id: req.params.id });
      res.status(200).json(order);
    }),
  };
};
