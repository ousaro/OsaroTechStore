import { asyncHandler } from "../../../../shared/infrastructure/http/asyncHandler.js";
import { assertOrdersInputPort } from "../../ports/input/ordersInputPort.js";

export const createOrdersHttpController = ({ ordersInputPort }) => {
  assertOrdersInputPort(ordersInputPort);

  const getAllOrdersHandler = asyncHandler(async (req, res) => {
    const payload = await ordersInputPort.getAllOrders();
    return res.status(200).json(payload);
  });

  const getOrderByIdHandler = asyncHandler(async (req, res) => {
    const payload = await ordersInputPort.getOrderById({ id: req.params.id });
    return res.status(200).json(payload);
  });

  const addOrderHandler = asyncHandler(async (req, res) => {
    const payload = await ordersInputPort.addOrder(req.body);
    return res.status(201).json(payload);
  });

  const updateOrderHandler = asyncHandler(async (req, res) => {
    const payload = await ordersInputPort.updateOrder({
      id: req.params.id,
      updates: req.body,
    });
    return res.status(200).json(payload);
  });

  const deleteOrderHandler = asyncHandler(async (req, res) => {
    const payload = await ordersInputPort.deleteOrder({ id: req.params.id });
    return res.status(200).json(payload);
  });

  return {
    getAllOrdersHandler,
    getOrderByIdHandler,
    addOrderHandler,
    updateOrderHandler,
    deleteOrderHandler,
  };
};
