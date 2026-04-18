export const toOrderRecord = (rawOrder) => {
  if (!rawOrder) {
    return null;
  }

  return {
    _id: rawOrder._id,
    ownerId: rawOrder.ownerId,
    products: rawOrder.products,
    totalPrice: rawOrder.totalPrice,
    status: rawOrder.status,
    address: rawOrder.address,
    paymentMethod: rawOrder.paymentMethod,
    paymentStatus: rawOrder.paymentStatus,
    transactionId: rawOrder.transactionId,
    paymentDetails: rawOrder.paymentDetails,
  };
};
