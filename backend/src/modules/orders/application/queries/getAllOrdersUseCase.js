import { toOrderReadModel } from "../read-models/orderReadModel.js";

export const buildGetAllOrdersUseCase = ({ orderRepository }) =>
  async ({ ownerId } = {}) => {
    const records = ownerId
      ? await orderRepository.findByOwnerId(ownerId)
      : await orderRepository.findAll();
    return records.map(toOrderReadModel);
  };
