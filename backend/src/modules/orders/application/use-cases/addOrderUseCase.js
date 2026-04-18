import { ApiError } from "../../../../shared/domain/errors/ApiError.js";
import { assertRequiredFields } from "../../../../shared/infrastructure/http/validation.js";

export const buildAddOrderUseCase = ({ orderRepository }) => {
  return async (payload) => {
    const {
      ownerId,
      products,
      totalPrice,
      status,
      address,
      paymentMethod,
      paymentStatus,
      transactionId,
      paymentDetails,
    } = payload;

    try {
      assertRequiredFields(address, ["city", "addressLine", "postalCode", "country"], "Invalid address format");
    } catch (_error) {
      const error = new ApiError("Invalid address format", 400, { responseKey: "message" });
      throw error;
    }

    return orderRepository.create({
      ownerId,
      products,
      totalPrice,
      status,
      address,
      paymentMethod,
      paymentStatus,
      transactionId,
      paymentDetails,
    });
  };
};
