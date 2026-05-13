import { createProductModel } from "../../persistence/mongo/productModel.js";
import { toProductRecord } from "../../persistence/mongo/productRecordMapper.js";

export const createMongooseProductRepository = ({ dbClient }) => {
  const ProductModel = createProductModel(dbClient);
  const withCategory = (query) => query.populate("category", "name");

  return {
    async findAll({ category, status } = {}) {
      const filter = {};
      if (category) filter.category = category;
      if (status) filter.status = status;
      const docs = await withCategory(ProductModel.find(filter).sort({ createdAt: -1 }));
      return docs.map(toProductRecord);
    },

    async findById(id) {
      return toProductRecord(await withCategory(ProductModel.findById(id)));
    },

    async create(primitives) {
      const created = await ProductModel.create(primitives);
      return toProductRecord(await withCategory(ProductModel.findById(created._id)));
    },

    async updateById(id, updates) {
      return toProductRecord(
        await withCategory(ProductModel.findByIdAndUpdate(id, updates, { new: true }))
      );
    },

    async deleteById(id) {
      return toProductRecord(await withCategory(ProductModel.findByIdAndDelete(id)));
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
