/**
 * Product Record Mapper.
 * Maps raw Mongoose documents to the plain record shape used by application code.
 */
export const toProductRecord = (doc) => {
  if (!doc) return null;

  const obj = doc.toObject ? doc.toObject() : doc;
  const categoryId = typeof obj.category === "object" && obj.category?._id
    ? obj.category._id.toString()
    : obj.category?.toString();
  const categoryName = typeof obj.category === "object" && obj.category?.name
    ? obj.category.name
    : obj.category?.toString();

  return {
    _id: obj._id?.toString(),
    name: obj.name,
    description: obj.description,
    price: obj.price,
    currency: obj.currency,
    categoryId,
    category: categoryName,
    stock: obj.stock,
    images: obj.images,
    status: obj.status,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
};
