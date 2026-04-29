import { createProductModel } from "../persistence/productModel.js";

const toRecord = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    _id:         obj._id?.toString(),
    name:        obj.name,
    description: obj.description,
    price:       obj.price,
    currency:    obj.currency,
    category:    obj.category?.toString(),
    stock:       obj.stock,
    images:      obj.images,
    status:      obj.status,
    createdAt:   obj.createdAt,
    updatedAt:   obj.updatedAt,
  };
};

export const createMongooseProductRepository = ({ dbClient }) => {
  const ProductModel = createProductModel(dbClient);

  return {
    async findAll({ category, status } = {}) {
      const filter = {};
      if (category) filter.category = category;
      if (status)   filter.status   = status;
      const docs = await ProductModel.find(filter).sort({ createdAt: -1 });
      return docs.map(toRecord);
    },

    async findById(id) {
      return toRecord(await ProductModel.findById(id));
    },

    async create(primitives) {
      return toRecord(await ProductModel.create(primitives));
    },

    async updateById(id, updates) {
      return toRecord(await ProductModel.findByIdAndUpdate(id, updates, { new: true }));
    },

    async deleteById(id) {
      return toRecord(await ProductModel.findByIdAndDelete(id));
    },

    async deleteByCategoryId(categoryId) {
      const result = await ProductModel.deleteMany({ category: categoryId });
      return result.deletedCount;
    },

    async updateStatusBefore({ fromStatus, toStatus, before }) {
      const result = await ProductModel.updateMany(
        { status: fromStatus, createdAt: { $lte: before } },
        { $set: { status: toStatus } }
      );
      return result.modifiedCount;
    },
  };
};
