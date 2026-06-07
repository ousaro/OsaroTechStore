import { createCategoryModel } from "../../persistence/mongo/categoryModel.js";
import { toCategoryRecord } from "../../persistence/mongo/categoryRecordMapper.js";
import {
  softDelete,
  restore,
} from "../../../../../../shared/infrastructure/persistence/mongooseSoftDeletePlugin.js";

export const createMongooseCategoryRepository = ({ dbClient }) => {
  const CategoryModel = createCategoryModel(dbClient);
  return {
    async findAll({ limit = 50, offset = 0 } = {}) {
      return (await CategoryModel.find().sort({ name: 1 }).skip(offset).limit(limit)).map(
        toCategoryRecord
      );
    },
    async findById(id) {
      return toCategoryRecord(await CategoryModel.findById(id));
    },
    async findAllWithDeleted() {
      return (await CategoryModel.find({ includeDeleted: true }).sort({ name: 1 })).map(
        toCategoryRecord
      );
    },
    async create(primitives) {
      return toCategoryRecord(await CategoryModel.create(primitives));
    },
    async updateById(id, updates) {
      return toCategoryRecord(await CategoryModel.findByIdAndUpdate(id, updates, { new: true }));
    },
    async deleteById(id) {
      const doc = await softDelete(CategoryModel, id);
      return toCategoryRecord(doc);
    },
    async restoreById(id) {
      const doc = await restore(CategoryModel, id);
      return toCategoryRecord(doc);
    },
  };
};
