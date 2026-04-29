import mongoose from "mongoose";

const paymentWorkflowSchema = new mongoose.Schema(
  {
    orderId:           { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    provider:          { type: String, required: true },
    workflowType:      { type: String, required: true },
    paymentStatus:     { type: String, required: true, default: "pending" },
    sessionId:         { type: String, default: null },
    providerPaymentId: { type: String, default: null },
    providerStatus:    { type: String, default: null },
    url:               { type: String, default: null },
    occurredAt:        { type: Date,   default: Date.now },
  },
  { timestamps: true }
);

paymentWorkflowSchema.index({ sessionId: 1 });
paymentWorkflowSchema.index({ orderId:   1 });

export const createPaymentModel = (connection) =>
  connection.models.PaymentWorkflow ??
  connection.model("PaymentWorkflow", paymentWorkflowSchema);
