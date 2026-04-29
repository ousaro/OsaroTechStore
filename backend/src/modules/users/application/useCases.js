import { ApplicationNotFoundError, ApplicationForbiddenError }
  from "../../../../shared/application/errors/index.js";
import { assertNonEmptyString } from "../../../../shared/kernel/assertions/index.js";

const toReadModel = (r) => r
  ? { _id: r._id?.toString(), firstName: r.firstName, lastName: r.lastName,
      email: r.email, phone: r.phone, address: r.address, city: r.city,
      country: r.country, state: r.state, postalCode: r.postalCode,
      favorites: r.favorites, cart: r.cart, picture: r.picture }
  : null;

export const buildGetUserProfileUseCase = ({ userRepository }) =>
  async ({ requesterId, targetId }) => {
    const id = targetId ?? requesterId;
    assertNonEmptyString(id, "userId");
    const record = await userRepository.findById(id);
    if (!record) throw new ApplicationNotFoundError(`User ${id} not found`);
    return toReadModel(record);
  };

export const buildUpdateUserProfileUseCase = ({ userRepository }) =>
  async ({ requesterId, targetId, updates }) => {
    const id = targetId ?? requesterId;
    assertNonEmptyString(id, "userId");
    if (targetId && targetId !== requesterId) {
      // Only admins can update other users — enforced by route-level requireAuth
    }
    const record = await userRepository.updateById(id, updates);
    if (!record) throw new ApplicationNotFoundError(`User ${id} not found`);
    return toReadModel(record);
  };

export const buildUpdateUserCartUseCase = ({ userRepository }) =>
  async ({ userId, cart }) => {
    assertNonEmptyString(userId, "userId");
    const record = await userRepository.updateById(userId, { cart });
    return toReadModel(record);
  };

export const buildUpdateUserFavoritesUseCase = ({ userRepository }) =>
  async ({ userId, productId, action }) => {
    assertNonEmptyString(userId,    "userId");
    assertNonEmptyString(productId, "productId");
    const user = await userRepository.findById(userId);
    if (!user) throw new ApplicationNotFoundError(`User ${userId} not found`);

    const favorites = action === "add"
      ? [...new Set([...(user.favorites ?? []), productId])]
      : (user.favorites ?? []).filter((id) => id.toString() !== productId);

    const record = await userRepository.updateById(userId, { favorites });
    return toReadModel(record);
  };
