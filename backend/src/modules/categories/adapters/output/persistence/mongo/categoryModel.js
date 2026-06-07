import mongoose from "mongoose";
import { softDeletePlugin } from "../../../../../../shared/infrastructure/persistence/mongooseSoftDeletePlugin.js";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

categorySchema.plugin(softDeletePlugin);

export const createCategoryModel = (connection) =>
  connection.models.Category ?? connection.model("Category", categorySchema);
