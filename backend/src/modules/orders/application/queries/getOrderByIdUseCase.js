import { OrderNotFoundError }   from "../errors/OrderApplicationError.js";
import { toOrderReadModel }     from "../read-models/orderReadModel.js";
import { assertNonEmptyString } from "../../../../shared/kernel/assertions/index.js";

export const buildGetOrderByIdUseCase = ({ orderRepository }) =>
  async ({ id }) => {
    assertNonEmptyString(id, "id");
    const record = await orderRepository.findById(id);
    if (!record) throw new OrderNotFoundError(`Order ${id} not found`);
    return toOrderReadModel(record);
  };
