import mongoose from "mongoose";
import ProductModel from "../persistence/productModel.js";
import { toProductEntity } from "../../domain/entities/ProductEntity.js";

export const createMongooseProductRepository = () => {
  return {
    isValidId(id) {
      return mongoose.Types.ObjectId.isValid(id);
    },

    async findAll() {
      const docs = await ProductModel.find({}).sort({ createdAt: -1 });
      return docs.map(toProductEntity);
    },

    async findById(productId) {
      const doc = await ProductModel.findById(productId);
      return doc ? toProductEntity(doc) : null;
    },

    async findRelated(productId) {
      const docs = await ProductModel.findRelated(productId);
      return docs.map(toProductEntity);
    },
    async create(product) {
      const doc = await ProductModel.create(product.toPrimitives());
      return toProductEntity(doc);
    },
    async findByIdAndUpdate(id, patch) {
      const doc = await ProductModel.findByIdAndUpdate(id, patch.toPrimitives(), { new: true });
      return doc ? toProductEntity(doc) : null;
    },
    async findByIdAndDelete(id) {
      const doc = await ProductModel.findByIdAndDelete({ _id: id });
      return doc ? toProductEntity(doc) : null;
    },
    async deleteByCategoryId(categoryId) {
      await ProductModel.deleteMany({ categoryId });
    },
    async updateNewStatus(id, isNewProduct) {
      const doc = await ProductModel.findById(id);
      if (!doc) return null;
      doc.isNewProduct = isNewProduct;
      await doc.save();
      return toProductEntity(doc);
    },
  };
};
