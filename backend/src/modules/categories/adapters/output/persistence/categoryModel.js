// Category Mongoose Model
// Fixed path: was src/modules/categories/output/adapters/repositories/mongo/
// Correct:    src/modules/categories/adapters/output/repositories/
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export const createCategoryModel = (connection) =>
  connection.models.Category ?? connection.model("Category", categorySchema);
