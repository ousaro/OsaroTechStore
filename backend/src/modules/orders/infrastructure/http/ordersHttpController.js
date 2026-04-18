import { assertOrdersInputPort } from "../../ports/input/ordersInputPort.js";

export const createOrdersHttpController = ({ ordersInputPort }) => {
  assertOrdersInputPort(ordersInputPort);

  const getAllOrdersHandler = async (req, res) => {
    const payload = await ordersInputPort.getAllOrders();
    return res.status(200).json(payload);
  };

  const getOrderByIdHandler = async (req, res) => {
    const payload = await ordersInputPort.getOrderById({ id: req.params.id });
    return res.status(200).json(payload);
  };

  const addOrderHandler = async (req, res) => {
    try {
      const payload = await ordersInputPort.addOrder(req.body);
      return res.status(201).json(payload);
    } catch (error) {
      const key = error.responseKey || "error";
      return res.status(error.statusCode || 500).json({ [key]: error.message });
    }
  };

  const updateOrderHandler = async (req, res) => {
    try {
      const payload = await ordersInputPort.updateOrder({
        id: req.params.id,
        updates: req.body,
      });
      return res.status(200).json(payload);
    } catch (error) {
      return res.status(error.statusCode || 400).json({ error: error.message });
    }
  };

  const deleteOrderHandler = async (req, res) => {
    try {
      const payload = await ordersInputPort.deleteOrder({ id: req.params.id });
      return res.status(200).json(payload);
    } catch (error) {
      const key = error.responseKey || "error";
      return res.status(error.statusCode || 500).json({ [key]: error.message });
    }
  };

  return {
    getAllOrdersHandler,
    getOrderByIdHandler,
    addOrderHandler,
    updateOrderHandler,
    deleteOrderHandler,
  };
};
