export const createOrdersCommandPort = ({
  addOrder,
  updateOrder,
  deleteOrder,
}) => {
  return assertOrdersCommandPort({
    addOrder,
    updateOrder,
    deleteOrder,
  });
};

export const assertOrdersCommandPort = (ordersCommandPort) => {
  if (!ordersCommandPort || typeof ordersCommandPort !== "object") {
    throw new Error("ordersCommandPort is required");
  }

  const requiredMethods = ["addOrder", "updateOrder", "deleteOrder"];

  for (const methodName of requiredMethods) {
    if (typeof ordersCommandPort[methodName] !== "function") {
      throw new Error(`ordersCommandPort must implement ${methodName}`);
    }
  }

  return ordersCommandPort;
};
