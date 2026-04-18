import mongoose from "mongoose";
import OrderModel from "../persistence/orderModel.js";
import { toOrderEntity } from "../../domain/entities/OrderEntity.js";

export const createMongooseOrderRepository = () => {
  return {
    isValidId(id) {
      return mongoose.Types.ObjectId.isValid(id);
    },

    async findAllSorted() {
      const docs = await OrderModel.find({}).sort({ createdAt: -1 });
      return docs.map(toOrderEntity);
    },

    async findById(id) {
      const doc = await OrderModel.findById(id);
      return doc ? toOrderEntity(doc) : null;
    },

    async create(order) {
      const doc = await OrderModel.create(order.toPrimitives());
      return toOrderEntity(doc);
    },
    async findByIdAndUpdate(id, updates) {
      const doc = await OrderModel.findByIdAndUpdate(id, updates, { new: true });
      return doc ? toOrderEntity(doc) : null;
    },
    async findByIdAndDelete(id) {
      const doc = await OrderModel.findByIdAndDelete({ _id: id });
      return doc ? toOrderEntity(doc) : null;
    },
  };
};
