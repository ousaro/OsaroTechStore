import CategoryModel from "../persistence/categoryModel.js";
import ProductModel from "../../../products/infrastructure/persistence/productModel.js";
import { toCategoryEntity } from "../../domain/entities/CategoryEntity.js";

export const createMongooseCategoryRepository = () => {
  return {
    async findAllSorted() {
      const docs = await CategoryModel.find({}).sort({ createdAt: -1 });
      return docs.map(toCategoryEntity);
    },
    async create(category) {
      const doc = await CategoryModel.create(category.toPrimitives());
      return toCategoryEntity(doc);
    },
    async deleteProductsByCategoryId(categoryId) {
      await ProductModel.deleteMany({ categoryId });
    },
    async findByIdAndDelete(id) {
      const doc = await CategoryModel.findByIdAndDelete({ _id: id });
      return doc ? toCategoryEntity(doc) : null;
    },
  };
};
