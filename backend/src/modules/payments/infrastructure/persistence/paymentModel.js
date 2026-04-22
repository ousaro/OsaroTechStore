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
    orderId: { type: String, required: false, index: true },
    url: { type: String, required: false },
    providerTransactionId: { type: String, required: false },
    paymentStatus: { type: String, required: true, default: "pending" },
    provider: { type: String, required: true, default: "stripe" },
    lastWebhookEventId: { type: String, required: false },
    statusUpdatedAt: { type: Date, required: false },
    paidAt: { type: Date, required: false },
    processedWebhookEventIds: { type: [String], required: true, default: [] },
  },
  { timestamps: true }
);

const PaymentModel = mongoose.model("Payment", paymentSchema);
export default PaymentModel;
