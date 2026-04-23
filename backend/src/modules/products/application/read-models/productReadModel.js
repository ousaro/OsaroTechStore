export const toProductReadModel = (product) => {
  if (!product) {
    return null;
  }

  return Object.fromEntries(
    Object.entries({
      _id: product._id,
      name: product.name,
      description: product.description,
      image: product.image,
      brand: product.brand,
      category: product.category,
      price: product.price,
      countInStock: product.countInStock,
      rating: product.rating,
      numReviews: product.numReviews,
      isNewProduct: product.isNewProduct,
    }).filter(([, value]) => value !== undefined)
  );
};
