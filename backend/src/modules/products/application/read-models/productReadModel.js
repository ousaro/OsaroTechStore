export const toProductReadModel = (record) => {
  if (!record) return null;
  return {
    _id:         record._id?.toString(),
    name:        record.name,
    description: record.description,
    price:       record.price,
    currency:    record.currency,
    category:    record.category?.toString(),
    stock:       record.stock,
    images:      record.images,
    status:      record.status,
    createdAt:   record.createdAt,
    updatedAt:   record.updatedAt,
  };
};
