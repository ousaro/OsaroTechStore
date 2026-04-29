import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price:       { type: Number, required: true },
    currency:    { type: String, default: "USD" },
    category:    { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    stock:       { type: Number, default: 0 },
    images:      { type: [String], default: [] },
    status:      { type: String, default: "new" },
  },
  { timestamps: true }
);

productSchema.index({ category: 1 });
productSchema.index({ status: 1, createdAt: 1 });

export const createProductModel = (connection) =>
  connection.models.Product ?? connection.model("Product", productSchema);
