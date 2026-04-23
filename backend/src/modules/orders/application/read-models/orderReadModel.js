export const toOrderReadModel = (order) => {
  if (!order) {
    return null;
  }

  return Object.fromEntries(
    Object.entries({
      _id: order._id,
      ownerId: order.ownerId,
      products: order.products,
      totalPrice: order.totalPrice,
      status: order.status,
      address: order.address,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      paymentReference: order.paymentReference,
    }).filter(([, value]) => value !== undefined)
  );
};
