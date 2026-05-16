export const toProductRecord = (doc) => {
  if (!doc) return null;

  const obj = doc.toObject ? doc.toObject() : doc;
  const categoryId =
    typeof obj.category === "object" && obj.category?._id
      ? obj.category._id.toString()
      : obj.category?.toString();
  const categoryName =
    typeof obj.category === "object" && obj.category?.name
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
    reviews: Array.isArray(obj.reviews)
      ? obj.reviews.map((review) => ({
          _id: review._id?.toString(),
          userId: review.userId,
          name: review.name,
          firstName: review.firstName,
          lastName: review.lastName,
          picture: review.picture,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
        }))
      : [],
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
};
