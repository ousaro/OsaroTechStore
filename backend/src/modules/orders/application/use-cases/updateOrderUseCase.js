export const buildUpdateOrderUseCase = ({ orderRepository }) => {
  return async ({ id, updates }) => {
    if (!orderRepository.isValidId(id)) {
      const error = new Error("Invalid order ID");
      error.statusCode = 404;
      throw error;
    }

    const order = await orderRepository.findByIdAndUpdate(id, updates);
    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    return order;
  };
};
