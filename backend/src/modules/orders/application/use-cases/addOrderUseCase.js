export const buildAddOrderUseCase = ({ orderRepository }) => {
  return async (payload) => {
    const {
      ownerId,
      products,
      totalPrice,
      status,
      address,
      paymentMethod,
      paymentStatus,
      transactionId,
      paymentDetails,
    } = payload;

    if (!address || !address.city || !address.addressLine || !address.postalCode || !address.country) {
      const error = new Error("Invalid address format");
      error.statusCode = 400;
      error.responseKey = "message";
      throw error;
    }

    return orderRepository.create({
      ownerId,
      products,
      totalPrice,
      status,
      address,
      paymentMethod,
      paymentStatus,
      transactionId,
      paymentDetails,
    });
  };
};
