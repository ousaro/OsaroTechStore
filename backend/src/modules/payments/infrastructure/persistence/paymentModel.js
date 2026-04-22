import mongoose from "mongoose";

const Schema = mongoose.Schema;

const paymentSchema = new Schema(
  {
    paymentReference: {
      type: String,
      required: true,
      unique: true,
      default: () => `pay_${new mongoose.Types.ObjectId().toString()}`,
    },
    sessionId: { type: String, required: true, unique: true },
    url: { type: String, required: false },
    paymentStatus: { type: String, required: true, default: "pending" },
    provider: { type: String, required: true, default: "stripe" },
    processedWebhookEventIds: { type: [String], required: true, default: [] },
  },
  { timestamps: true }
);

const PaymentModel = mongoose.model("Payment", paymentSchema);
export default PaymentModel;
