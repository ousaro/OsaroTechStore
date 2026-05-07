import { PaymentNotFoundError } from "../errors/PaymentApplicationError.js";
import { toPaymentReadModel } from "../read-models/paymentReadModel.js";
import { assertNonEmptyString } from "../../../../shared/kernel/assertions/index.js";

export const buildGetPaymentByOrderIdUseCase =
  ({ paymentRepository }) =>
  async ({ orderId }) => {
    assertNonEmptyString(orderId, "orderId");
    const record = await paymentRepository.findByOrderId(orderId);
    if (!record) throw new PaymentNotFoundError(`No payment found for order ${orderId}`);
    return toPaymentReadModel(record);
  };
