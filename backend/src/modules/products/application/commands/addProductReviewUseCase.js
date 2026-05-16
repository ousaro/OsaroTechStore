import { ProductNotFoundError } from "../errors/ProductApplicationError.js";
import { toProductReadModel } from "../read-models/productReadModel.js";
import {
  assertNonEmptyString,
  assertPositiveNumber,
} from "../../../../shared/kernel/assertions/index.js";
import { DomainValidationError } from "../../../../shared/domain/errors/index.js";

export const buildAddProductReviewUseCase =
  ({ productRepository }) =>
  async ({ id, userId, name, firstName, lastName, picture, rating, comment }) => {
    try {
      assertNonEmptyString(id, "id");
      assertNonEmptyString(userId, "userId");
      assertNonEmptyString(comment, "comment");
      assertPositiveNumber(Number(rating), "rating");
    } catch (error) {
      throw new DomainValidationError(error.message);
    }

    const numericRating = Number(rating);
    if (numericRating < 1 || numericRating > 5) {
      throw new DomainValidationError("rating must be between 1 and 5");
    }

    const saved = await productRepository.addReview(id, {
      userId,
      name: name || "Customer",
      firstName: firstName || "",
      lastName: lastName || "",
      picture: picture || "",
      rating: numericRating,
      comment: comment.trim(),
    });

    if (!saved) throw new ProductNotFoundError(`Product ${id} not found`);
    return toProductReadModel(saved);
  };
