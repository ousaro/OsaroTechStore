/**
 * Orders HTTP Controller.
 * Thin adapter — parses HTTP in, calls use cases, writes HTTP out.
 * Zero domain logic lives here.
 */
import { asyncHandler } from "../../../../../shared/infrastructure/http/middleware/asyncHandler.js";

export const createOrdersHttpController = ({ commandPort, queryPort }) => ({
  getAllOrders: asyncHandler(async (req, res) => {
    const orders = await queryPort.getAllOrders({ ownerId: req.query.ownerId });
    res.status(200).json(orders);
  }),

  getOrderById: asyncHandler(async (req, res) => {
    const order = await queryPort.getOrderById({ id: req.params.id });
    res.status(200).json(order);
  }),

  addOrder: asyncHandler(async (req, res) => {
    const order = await commandPort.addOrder({
      ownerId:         req.user._id,
      orderLines:      req.body.orderLines,
      deliveryAddress: req.body.deliveryAddress,
      currency:        req.body.currency ?? "USD",
    });
    res.status(201).json(order);
  }),

  updateOrder: asyncHandler(async (req, res) => {
    const order = await commandPort.updateOrder({
      id:      req.params.id,
      updates: req.body,
    });
    res.status(200).json(order);
  }),

  deleteOrder: asyncHandler(async (req, res) => {
    const order = await commandPort.deleteOrder({ id: req.params.id });
    res.status(200).json(order);
  }),
});
