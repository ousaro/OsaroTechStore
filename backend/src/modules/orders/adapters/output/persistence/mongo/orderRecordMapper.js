export const toOrderRecord = (doc) => {
  if (!doc) return null;

  const obj = doc.toObject ? doc.toObject() : doc;

  const isPopulated = typeof obj.ownerId === "object" && obj.ownerId !== null;
  return {
    _id: obj._id?.toString(),
    ownerId: isPopulated ? obj.ownerId._id?.toString() : obj.ownerId?.toString(),
    customerName: isPopulated
      ? [obj.ownerId.firstName, obj.ownerId.lastName].filter(Boolean).join(" ")
      : "",
    customerEmail: isPopulated ? obj.ownerId.email || "" : "",
    orderLines: (obj.orderLines ?? []).map((line) => ({
      productId: line.productId,
      name: line.name,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      subtotal: line.subtotal,
    })),
    deliveryAddress: { ...(obj.deliveryAddress ?? {}), phone: obj.deliveryAddress?.phone ?? "" },
    currency: obj.currency,
    orderStatus: obj.orderStatus,
    paymentStatus: obj.paymentStatus,
    totalPrice: obj.totalPrice,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
};
