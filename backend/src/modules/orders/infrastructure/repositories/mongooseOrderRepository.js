import mongoose from "mongoose";
import Order from "../../../../models/orderModel.js";
import { toOrderEntity } from "../../domain/entities/OrderEntity.js";

export const createMongooseOrderRepository = () => {
  return {
    isValidId(id) {
      return mongoose.Types.ObjectId.isValid(id);
    },
    async findAllSorted() {
      const docs = await Order.find({}).sort({ createdAt: -1 });
      return docs.map(toOrderEntity);
    },
    async create(data) {
      const doc = await Order.create(data);
      return toOrderEntity(doc);
    },
    async findByIdAndUpdate(id, updates) {
      const doc = await Order.findByIdAndUpdate(id, updates, { new: true });
      return doc ? toOrderEntity(doc) : null;
    },
    async findByIdAndDelete(id) {
      const doc = await Order.findByIdAndDelete({ _id: id });
      return doc ? toOrderEntity(doc) : null;
    },
  };
};
