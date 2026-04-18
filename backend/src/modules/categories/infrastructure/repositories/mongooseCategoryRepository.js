import Category from "../../../../models/categoryModel.js";
import Product from "../../../../models/productModel.js";
import { toCategoryEntity } from "../../domain/entities/CategoryEntity.js";

export const createMongooseCategoryRepository = () => {
  return {
    async findAllSorted() {
      const docs = await Category.find({}).sort({ createdAt: -1 });
      return docs.map(toCategoryEntity);
    },
    async create(data) {
      const doc = await Category.create(data);
      return toCategoryEntity(doc);
    },
    async deleteProductsByCategoryId(categoryId) {
      await Product.deleteMany({ categoryId });
    },
    async findByIdAndDelete(id) {
      const doc = await Category.findByIdAndDelete({ _id: id });
      return doc ? toCategoryEntity(doc) : null;
    },
  };
};
