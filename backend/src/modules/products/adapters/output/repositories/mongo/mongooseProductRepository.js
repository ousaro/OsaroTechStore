import { createProductModel } from "../../persistence/mongo/productModel.js";
import { toProductRecord } from "../../persistence/mongo/productRecordMapper.js";

export const createMongooseProductRepository = ({ dbClient }) => {
  const ProductModel = createProductModel(dbClient);

  return {
    async findAll({ category, status } = {}) {
      const filter = {};
      if (category) filter.category = category;
      if (status) filter.status = status;
      const docs = await ProductModel.find(filter).sort({ createdAt: -1 });
      return docs.map(toProductRecord);
    },

    async findById(id) {
      return toProductRecord(await ProductModel.findById(id));
    },

    async create(primitives) {
      return toProductRecord(await ProductModel.create(primitives));
    },

    async updateById(id, updates) {
      return toProductRecord(await ProductModel.findByIdAndUpdate(id, updates, { new: true }));
    },

    async deleteById(id) {
      return toProductRecord(await ProductModel.findByIdAndDelete(id));
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
