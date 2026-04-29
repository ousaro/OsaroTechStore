/**
 * Order Record Mapper.
 * Maps between Mongoose documents and the flat primitives the domain uses.
 * All snake_case ↔ camelCase normalization happens HERE — never in the domain.
 */
export const toOrderRecord = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    _id:             obj._id?.toString(),
    ownerId:         obj.ownerId?.toString(),
    orderLines:      (obj.orderLines ?? []).map((l) => ({
      productId: l.productId,
      name:      l.name,
      quantity:  l.quantity,
      unitPrice: l.unitPrice,
      subtotal:  l.subtotal,
    })),
    deliveryAddress: obj.deliveryAddress ?? {},
    currency:        obj.currency,
    orderStatus:     obj.orderStatus,
    paymentStatus:   obj.paymentStatus,
    totalPrice:      obj.totalPrice,
    createdAt:       obj.createdAt,
    updatedAt:       obj.updatedAt,
  };
};
