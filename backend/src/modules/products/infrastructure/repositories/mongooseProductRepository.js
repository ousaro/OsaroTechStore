import Product from "../../../../models/productModel.js";
import { toProductEntity } from "../../domain/entities/ProductEntity.js";

export const createMongooseProductRepository = () => {
  return {
    async findAll() {
      const docs = await Product.find({}).sort({ createdAt: -1 });
      return docs.map(toProductEntity);
    },

    async findById(productId) {
      const doc = await Product.findById(productId);
      return doc ? toProductEntity(doc) : null;
    },

    async findRelated(productId) {
      const docs = await Product.findRelated(productId);
      return docs.map(toProductEntity);
    },
  };
};
