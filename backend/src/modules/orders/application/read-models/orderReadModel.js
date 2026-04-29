/**
 * Order Read Model.
 * Maps the persistence record into the shape returned by the API.
 * Read models are intentionally flat and client-friendly.
 */
export const toOrderReadModel = (record) => {
  if (!record) return null;

  return {
    _id:             record._id?.toString(),
    ownerId:         record.ownerId?.toString(),
    orderLines:      record.orderLines ?? [],
    deliveryAddress: record.deliveryAddress ?? {},
    currency:        record.currency,
    orderStatus:     record.orderStatus,
    paymentStatus:   record.paymentStatus,
    totalPrice:      record.totalPrice,
    createdAt:       record.createdAt,
    updatedAt:       record.updatedAt,
  };
};
