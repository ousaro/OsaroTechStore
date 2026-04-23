import { asyncHandler } from "../../../../shared/infrastructure/http/asyncHandler.js";
import { assertOrdersCommandPort } from "../../ports/input/ordersCommandPort.js";
import { assertOrdersQueryPort } from "../../ports/input/ordersQueryPort.js";

export const createOrdersHttpController = ({
  ordersCommandPort,
  ordersQueryPort,
}) => {
  assertOrdersCommandPort(ordersCommandPort);
  assertOrdersQueryPort(ordersQueryPort);

  const getAllOrdersHandler = asyncHandler(async (req, res) => {
    const payload = await ordersQueryPort.getAllOrders();
    return res.status(200).json(payload);
  });

  const getOrderByIdHandler = asyncHandler(async (req, res) => {
    const payload = await ordersQueryPort.getOrderById({ id: req.params.id });
    return res.status(200).json(payload);
  });

  const addOrderHandler = asyncHandler(async (req, res) => {
    const payload = await ordersCommandPort.addOrder(req.body);
    return res.status(201).json(payload);
  });

  const updateOrderHandler = asyncHandler(async (req, res) => {
    const payload = await ordersCommandPort.updateOrder({
      id: req.params.id,
      updates: req.body,
    });
    return res.status(200).json(payload);
  });

  const deleteOrderHandler = asyncHandler(async (req, res) => {
    const payload = await ordersCommandPort.deleteOrder({ id: req.params.id });
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
