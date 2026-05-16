export const toCategoryRecord = (doc) => {
  if (!doc) return null;

  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    _id: obj._id?.toString(),
    name: obj.name,
    description: obj.description,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
};
