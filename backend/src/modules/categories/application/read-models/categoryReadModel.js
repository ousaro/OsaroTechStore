export const toCategoryReadModel = (record) => record
  ? {
      _id:         record._id?.toString(),
      name:        record.name,
      description: record.description,
      createdAt:   record.createdAt,
      updatedAt:   record.updatedAt,
    }
  : null;
