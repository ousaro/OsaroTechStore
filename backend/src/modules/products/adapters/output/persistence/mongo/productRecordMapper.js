/**
 * Product Record Mapper.
 * Maps raw Mongoose documents to the plain record shape used by application code.
 */
export const toProductRecord = (doc) => {
  if (!doc) return null;

  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    _id: obj._id?.toString(),
    name: obj.name,
    description: obj.description,
    price: obj.price,
    currency: obj.currency,
    category: obj.category?.toString(),
    stock: obj.stock,
    images: obj.images,
    status: obj.status,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
};
