/**
 * Mongoose Order Repository.
 *
 * Fixed from original:
 *  - Accepts dbClient injected by the composition root.
 *  - Creates its own model from the connection — no global OrderModel import.
 *  - All methods return plain records via toOrderRecord() mapper.
 */
import { createOrderModel }  from "../persistence/mongo/orderModel.js";
import { toOrderRecord }     from "../persistence/mongo/orderRecordMapper.js";

export const createMongooseOrderRepository = ({ dbClient }) => {
  const OrderModel = createOrderModel(dbClient);

  return {
    async findAll() {
      const docs = await OrderModel.find().sort({ createdAt: -1 });
      return docs.map(toOrderRecord);
    },

    async findByOwnerId(ownerId) {
      const docs = await OrderModel.find({ ownerId }).sort({ createdAt: -1 });
      return docs.map(toOrderRecord);
    },

    async findById(id) {
      const doc = await OrderModel.findById(id);
      return toOrderRecord(doc);
    },

    async create(primitives) {
      const doc = await OrderModel.create(primitives);
      return toOrderRecord(doc);
    },

    async updateById(id, primitives) {
      const doc = await OrderModel.findByIdAndUpdate(id, primitives, { new: true });
      return toOrderRecord(doc);
    },

    async deleteById(id) {
      const doc = await OrderModel.findByIdAndDelete(id);
      return toOrderRecord(doc);
    },
  };
};
