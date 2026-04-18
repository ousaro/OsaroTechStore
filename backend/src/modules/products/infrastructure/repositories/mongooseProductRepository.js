import mongoose from "mongoose";
import ProductModel from "../persistence/productModel.js";
import { toProductRecord } from "./productRecordMapper.js";

export const createMongooseProductRepository = () => {
  return {
    isValidId(id) {
      return mongoose.Types.ObjectId.isValid(id);
    },

    async findAll() {
      const docs = await ProductModel.find({}).sort({ createdAt: -1 });
      return docs.map(toProductRecord);
    },

    async findById(productId) {
      const doc = await ProductModel.findById(productId);
      return doc ? toProductRecord(doc) : null;
    },

    async findRelated(productId) {
      const docs = await ProductModel.findRelated(productId);
      return docs.map(toProductRecord);
    },
    async create(product) {
      const doc = await ProductModel.create(product.toPrimitives());
      return toProductRecord(doc);
    },
    async findByIdAndUpdate(id, patch) {
      const doc = await ProductModel.findByIdAndUpdate(id, patch.toPrimitives(), { new: true });
      return doc ? toProductRecord(doc) : null;
    },
    async findByIdAndDelete(id) {
      const doc = await ProductModel.findByIdAndDelete({ _id: id });
      return doc ? toProductRecord(doc) : null;
    },
    async deleteByCategoryId(categoryId) {
      await ProductModel.deleteMany({ categoryId });
    },
    async updateNewStatus(id, isNewProduct) {
      const doc = await ProductModel.findById(id);
      if (!doc) return null;
      doc.isNewProduct = isNewProduct;
      await doc.save();
      return toProductRecord(doc);
    },
  };
};
