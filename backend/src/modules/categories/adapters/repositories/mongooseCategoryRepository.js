import CategoryModel from "../persistence/categoryModel.js";
import { toCategoryRecord } from "./categoryRecordMapper.js";

export const createMongooseCategoryRepository = () => {
  return {
    async findAllSorted() {
      const docs = await CategoryModel.find({}).sort({ createdAt: -1 });
      return docs.map(toCategoryRecord);
    },
    async create(category) {
      const doc = await CategoryModel.create(category.toPrimitives());
      return toCategoryRecord(doc);
    },
    async findByIdAndDelete(id) {
      const doc = await CategoryModel.findByIdAndDelete({ _id: id });
      return doc ? toCategoryRecord(doc) : null;
    },
  };
};
