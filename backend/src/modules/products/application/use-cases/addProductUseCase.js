export const buildAddProductUseCase = ({ productRepository }) => {
  return async ({ ownerId, payload }) => {
    const {
      name,
      description,
      raw_price,
      discount,
      image,
      otherImages,
      categoryId,
      category,
      countInStock,
      moreInformations,
    } = payload;

    const price = raw_price - (raw_price * discount / 100);
    const rating = "0";

    const emptyFields = [];
    if (!name) emptyFields.push("name");
    if (!description) emptyFields.push("description");
    if (!raw_price) emptyFields.push("raw_price");
    if (!discount) emptyFields.push("discount");
    if (!image) emptyFields.push("image");
    if (!otherImages) emptyFields.push("otherImages");
    if (!categoryId) emptyFields.push("categoryId");
    if (!category) emptyFields.push("category");
    if (!countInStock) emptyFields.push("countInStock");
    if (!moreInformations) emptyFields.push("moreInformations");

    if (emptyFields.length > 0) {
      const error = new Error("Please fill in all the fields");
      error.statusCode = 400;
      error.meta = { emptyFields };
      throw error;
    }

    if (raw_price < 0 || countInStock < 0) {
      const error = new Error("Price and countInStock cannot be negative");
      error.statusCode = 400;
      throw error;
    }

    return productRepository.create({
      ownerId,
      name,
      description,
      price,
      raw_price,
      discount,
      image,
      otherImages,
      categoryId,
      category,
      countInStock,
      moreInformations,
      rating,
    });
  };
};
