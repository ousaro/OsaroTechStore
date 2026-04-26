import mongoose from "mongoose";
import OrderModel from "../../persistence/mongo/orderModel.js";
import { toOrderRecord } from "../../persistence/mongo/orderRecordMapper.js";

export const createMongooseOrderRepository = () => {
  return {
    isValidId(id) {
      return mongoose.Types.ObjectId.isValid(id);
    },

    async findAllSorted() {
      const docs = await OrderModel.find({}).sort({ createdAt: -1 });
      return docs.map(toOrderRecord);
    },

    async findById(id) {
      const doc = await OrderModel.findById(id);
      return doc ? toOrderRecord(doc) : null;
    },

    async findByPaymentReference(paymentReference) {
      const doc = await OrderModel.findOne({ paymentReference });
      return doc ? toOrderRecord(doc) : null;
    },

    async create(order) {
      const doc = await OrderModel.create(order.toPrimitives());
      return toOrderRecord(doc);
    },
    async findByIdAndUpdate(id, patch) {
      const doc = await OrderModel.findByIdAndUpdate(id, patch.toPrimitives(), { new: true });
      return doc ? toOrderRecord(doc) : null;
    },
    async findByIdAndDelete(id) {
      const doc = await OrderModel.findByIdAndDelete({ _id: id });
      return doc ? toOrderRecord(doc) : null;
    },
  };
};
