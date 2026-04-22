import mongoose from "mongoose";

const Schema = mongoose.Schema;

const paymentSchema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    url: { type: String, required: false },
    paymentStatus: { type: String, required: true, default: "pending" },
    provider: { type: String, required: true, default: "stripe" },
  },
  { timestamps: true }
);

const PaymentModel = mongoose.model("Payment", paymentSchema);
export default PaymentModel;
