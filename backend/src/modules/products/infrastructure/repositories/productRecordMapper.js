export const toProductRecord = (rawProduct) => {
  if (!rawProduct) {
    return null;
  }

  return {
    _id: rawProduct._id,
    ownerId: rawProduct.ownerId,
    name: rawProduct.name,
    description: rawProduct.description,
    price: rawProduct.price,
    raw_price: rawProduct.raw_price,
    discount: rawProduct.discount,
    image: rawProduct.image,
    otherImages: rawProduct.otherImages,
    categoryId: rawProduct.categoryId,
    category: rawProduct.category,
    countInStock: rawProduct.countInStock,
    moreInformations: rawProduct.moreInformations,
    reviews: rawProduct.reviews,
    rating: rawProduct.rating,
    isNewProduct: rawProduct.isNewProduct,
    salesCount: rawProduct.salesCount,
    lastSold: rawProduct.lastSold,
    listedAt: rawProduct.listedAt ?? rawProduct.createdAt,
  };
};
