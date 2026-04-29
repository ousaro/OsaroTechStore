/**
 * Mongoose Category Repository.
 * Fixed: was named createMongooseCategorieRepository (French plural typo).
 */
import { createCategoryModel } from "../persistence/categoryModel.js";

const toRecord = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  return { _id: obj._id?.toString(), name: obj.name, description: obj.description,
           createdAt: obj.createdAt, updatedAt: obj.updatedAt };
};

export const createMongooseCategoryRepository = ({ dbClient }) => {
  const CategoryModel = createCategoryModel(dbClient);
  return {
    async findAll() {
      return (await CategoryModel.find().sort({ name: 1 })).map(toRecord);
    },
    async findById(id) {
      return toRecord(await CategoryModel.findById(id));
    },
    async create(primitives) {
      return toRecord(await CategoryModel.create(primitives));
    },
    async updateById(id, updates) {
      return toRecord(await CategoryModel.findByIdAndUpdate(id, updates, { new: true }));
    },
    async deleteById(id) {
      return toRecord(await CategoryModel.findByIdAndDelete(id));
    },
  };
};
