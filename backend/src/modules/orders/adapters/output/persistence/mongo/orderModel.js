import mongoose from "mongoose";

const moneySchema = new mongoose.Schema(
  { amount: { type: Number, required: true }, currency: { type: String, required: true } },
  { _id: false }
);

const orderLineSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name:      { type: String, required: true },
    quantity:  { type: Number, required: true },
    unitPrice: { type: moneySchema, required: true },
    subtotal:  { type: moneySchema, required: true },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    street:     String,
    city:       String,
    state:      String,
    postalCode: String,
    country:    String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    ownerId:         { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderLines:      { type: [orderLineSchema], required: true },
    deliveryAddress: { type: addressSchema,     required: true },
    currency:        { type: String,            required: true, default: "USD" },
    orderStatus:     { type: String,            required: true, default: "pending" },
    paymentStatus:   { type: String,            required: true, default: "pending" },
    totalPrice:      { type: moneySchema,       required: true },
  },
  { timestamps: true }
);

export const createOrderModel = (connection) =>
  connection.models.Order ?? connection.model("Order", orderSchema);
