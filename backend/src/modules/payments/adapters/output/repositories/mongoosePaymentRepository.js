import { createPaymentModel } from "../persistence/paymentModel.js";
import { toPaymentRecord }    from "./paymentRecordMapper.js";

export const createMongoosePaymentRepository = ({ dbClient }) => {
  const PaymentModel = createPaymentModel(dbClient);

  return {
    async create(primitives) {
      const doc = await PaymentModel.create(primitives);
      return toPaymentRecord(doc);
    },

    async findById(id) {
      const doc = await PaymentModel.findById(id);
      return toPaymentRecord(doc);
    },

    async findByOrderId(orderId) {
      const doc = await PaymentModel.findOne({ orderId });
      return toPaymentRecord(doc);
    },

    async findBySessionId(sessionId) {
      const doc = await PaymentModel.findOne({ sessionId });
      return toPaymentRecord(doc);
    },

    async updateById(id, primitives) {
      const doc = await PaymentModel.findByIdAndUpdate(id, primitives, { new: true });
      return toPaymentRecord(doc);
    },
  };
};
