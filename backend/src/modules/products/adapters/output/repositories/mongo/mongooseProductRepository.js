import { createProductModel } from "../../persistence/mongo/productModel.js";
import { toProductRecord } from "../../persistence/mongo/productRecordMapper.js";

const CACHE_TTL = 300;

const cacheKey = (id) => `product:${id}`;

export const createMongooseProductRepository = ({ dbClient, cache } = {}) => {
  const ProductModel = createProductModel(dbClient);
  const withCategory = (query) => query.populate("category", "name");

  return {
    async findAll({ category, status, limit = 50, offset = 0 } = {}) {
      const filter = {};
      if (category) filter.category = category;
      if (status) filter.status = status;
      const docs = await withCategory(
        ProductModel.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit)
      );
      return docs.map(toProductRecord);
    },

    async findById(id) {
      if (cache) {
        const cached = await cache.get(cacheKey(id));
        if (cached) return JSON.parse(cached);
      }
      const result = toProductRecord(await withCategory(ProductModel.findById(id)));
      if (cache && result) {
        await cache.setEx(cacheKey(id), CACHE_TTL, JSON.stringify(result));
      }
      return result;
    },

    async create(primitives) {
      const created = await ProductModel.create(primitives);
      const result = toProductRecord(await withCategory(ProductModel.findById(created._id)));
      if (cache) {
        await cache.del(cacheKey(result._id));
      }
      return result;
    },

    async updateById(id, updates) {
      const result = toProductRecord(
        await withCategory(ProductModel.findByIdAndUpdate(id, updates, { new: true }))
      );
      if (cache) {
        await cache.del(cacheKey(id));
      }
      return result;
    },

    async addReview(id, review) {
      const result = toProductRecord(
        await withCategory(
          ProductModel.findByIdAndUpdate(
            id,
            { $push: { reviews: { $each: [review], $position: 0 } } },
            { new: true, runValidators: true }
          )
        )
      );
      if (cache) {
        await cache.del(cacheKey(id));
      }
      return result;
    },

    async deleteById(id) {
      const result = toProductRecord(await withCategory(ProductModel.findByIdAndDelete(id)));
      if (cache) {
        await cache.del(cacheKey(id));
      }
      return result;
    },

    async deleteByCategoryId(categoryId) {
      const result = await ProductModel.deleteMany({ category: categoryId });
      return result.deletedCount;
    },

    async decrementStock(items) {
      const results = await Promise.all(
        items.map(({ productId, quantity }) =>
          ProductModel.findOneAndUpdate(
            { _id: productId, stock: { $gte: quantity } },
            { $inc: { stock: -quantity } },
            { new: true, select: "stock" }
          ).then((doc) => ({ productId, success: !!doc }))
        )
      );
      return results;
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
