import mongoose from "mongoose";

const productReviewSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, default: "Customer" },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    picture: { type: String, default: "" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    stock: { type: Number, default: 0 },
    images: { type: [String], default: [] },
    status: { type: String, default: "new" },
    reviews: { type: [productReviewSchema], default: [] },
  },
  { timestamps: true }
);

productSchema.index({ category: 1 });
productSchema.index({ status: 1, createdAt: 1 });

export const createProductModel = (connection) =>
  connection.models.Product ?? connection.model("Product", productSchema);
