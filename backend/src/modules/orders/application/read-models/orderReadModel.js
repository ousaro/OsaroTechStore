export const toOrderReadModel = (record) => {
  if (!record) return null;

  return {
    _id: record._id?.toString(),
    ownerId: record.ownerId?.toString(),
    customerName: record.customerName ?? "",
    customerEmail: record.customerEmail ?? "",
    orderLines: record.orderLines ?? [],
    deliveryAddress: record.deliveryAddress ?? {},
    currency: record.currency,
    orderStatus: record.orderStatus,
    paymentStatus: record.paymentStatus,
    totalPrice: record.totalPrice,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
};
