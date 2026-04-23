export const toCategoryReadModel = (category) => {
  if (!category) {
    return null;
  }

  return Object.fromEntries(
    Object.entries({
      _id: category._id,
      name: category.name,
      description: category.description,
      image: category.image,
    }).filter(([, value]) => value !== undefined)
  );
};
