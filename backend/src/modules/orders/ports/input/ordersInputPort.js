export const createOrdersInputPort = ({
  getAllOrders,
  getOrderById,
  addOrder,
  updateOrder,
  deleteOrder,
}) => {
  return assertOrdersInputPort({
    getAllOrders,
    getOrderById,
    addOrder,
    updateOrder,
    deleteOrder,
  });
};

export const assertOrdersInputPort = (ordersInputPort) => {
  if (!ordersInputPort || typeof ordersInputPort !== "object") {
    throw new Error("ordersInputPort is required");
  }

  const requiredMethods = [
    "getAllOrders",
    "getOrderById",
    "addOrder",
    "updateOrder",
    "deleteOrder",
  ];

  for (const methodName of requiredMethods) {
    if (typeof ordersInputPort[methodName] !== "function") {
      throw new Error(`ordersInputPort must implement ${methodName}`);
    }
  }

  return ordersInputPort;
};
