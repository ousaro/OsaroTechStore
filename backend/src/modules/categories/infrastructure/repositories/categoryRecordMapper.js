export const toCategoryRecord = (rawCategory) => {
  if (!rawCategory) {
    return null;
  }

  return {
    _id: rawCategory._id,
    name: rawCategory.name,
    image: rawCategory.image,
  };
};
