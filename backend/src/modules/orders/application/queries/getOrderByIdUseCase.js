import { OrderNotFoundError } from "../errors/OrderApplicationError.js";
import { toOrderReadModel } from "../read-models/orderReadModel.js";
import { ApplicationForbiddenError } from "../../../../shared/application/errors/index.js";
import { assertNonEmptyString } from "../../../../shared/kernel/assertions/index.js";

const assertCanAccessOrder = ({ order, requesterId, requesterIsAdmin }) => {
  assertNonEmptyString(requesterId, "requesterId");
  if (!requesterIsAdmin && order.ownerId?.toString() !== requesterId.toString()) {
    throw new ApplicationForbiddenError("You can only access your own orders");
  }
};

export const buildGetOrderByIdUseCase =
  ({ orderRepository }) =>
  async ({ id, requesterId, requesterIsAdmin = false }) => {
    assertNonEmptyString(id, "id");
    const record = await orderRepository.findById(id);
    if (!record) throw new OrderNotFoundError(`Order ${id} not found`);
    assertCanAccessOrder({ order: record, requesterId, requesterIsAdmin });
    return toOrderReadModel(record);
  };
