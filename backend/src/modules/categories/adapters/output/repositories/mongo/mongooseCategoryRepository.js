import { createCategoryModel } from "../../persistence/mongo/categoryModel.js";
import { toCategoryRecord } from "../../persistence/mongo/categoryRecordMapper.js";

export const createMongooseCategoryRepository = ({ dbClient }) => {
  const CategoryModel = createCategoryModel(dbClient);
  return {
    async findAll() {
      return (await CategoryModel.find().sort({ name: 1 })).map(toCategoryRecord);
    },
    async findById(id) {
      return toCategoryRecord(await CategoryModel.findById(id));
    },
    async create(primitives) {
      return toCategoryRecord(await CategoryModel.create(primitives));
    },
    async updateById(id, updates) {
      return toCategoryRecord(await CategoryModel.findByIdAndUpdate(id, updates, { new: true }));
    },
    async deleteById(id) {
      return toCategoryRecord(await CategoryModel.findByIdAndDelete(id));
    },
  };
};
