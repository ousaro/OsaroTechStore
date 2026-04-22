export const createOrdersQueryPort = ({
  getAllOrders,
  getOrderById,
}) => {
  return assertOrdersQueryPort({
    getAllOrders,
    getOrderById,
  });
};

export const assertOrdersQueryPort = (ordersQueryPort) => {
  if (!ordersQueryPort || typeof ordersQueryPort !== "object") {
    throw new Error("ordersQueryPort is required");
  }

  const requiredMethods = ["getAllOrders", "getOrderById"];

  for (const methodName of requiredMethods) {
    if (typeof ordersQueryPort[methodName] !== "function") {
      throw new Error(`ordersQueryPort must implement ${methodName}`);
    }
  }

  return ordersQueryPort;
};
