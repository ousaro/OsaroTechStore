import mongoose from "mongoose";
import Product from "../../../../models/productModel.js";
import { toProductEntity } from "../../domain/entities/ProductEntity.js";

export const createMongooseProductRepository = () => {
  return {
    isValidId(id) {
      return mongoose.Types.ObjectId.isValid(id);
    },

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
    async create(data) {
      const doc = await Product.create(data);
      return toProductEntity(doc);
    },
    async findByIdAndUpdate(id, updates) {
      const doc = await Product.findByIdAndUpdate(id, updates, { new: true });
      return doc ? toProductEntity(doc) : null;
    },
    async findByIdAndDelete(id) {
      const doc = await Product.findByIdAndDelete({ _id: id });
      return doc ? toProductEntity(doc) : null;
    },
    async updateNewStatus(id, isNewProduct) {
      const doc = await Product.findById(id);
      if (!doc) return null;
      doc.isNewProduct = isNewProduct;
      await doc.save();
      return toProductEntity(doc);
    },
  };
};
