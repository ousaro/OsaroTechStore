import { asyncHandler } from "../../../../../shared/infrastructure/http/middleware/asyncHandler.js";
import { assertUsersInputPort } from "../../../ports/input/usersInputPort.js";

export const createUsersHttpController = ({ usersInputPort }) => {
  assertUsersInputPort(usersInputPort);

  return {
    getMyProfile: asyncHandler(async (req, res) => {
      res.json(await usersInputPort.getUserProfile({ requesterId: req.user._id }));
    }),
    getUserById: asyncHandler(async (req, res) => {
      res.json(
        await usersInputPort.getUserProfile({ requesterId: req.user._id, targetId: req.params.id })
      );
    }),
    updateProfile: asyncHandler(async (req, res) => {
      res.json(
        await usersInputPort.updateUserProfile({ requesterId: req.user._id, updates: req.body })
      );
    }),
    updatePassword: asyncHandler(async (req, res) => {
      res.json(
        await usersInputPort.updateUserPassword({
          userId: req.user._id,
          currentPassword: req.body.currentPassword,
          newPassword: req.body.newPassword,
          confirmPassword: req.body.confirmPassword,
        })
      );
    }),
    updateCart: asyncHandler(async (req, res) => {
      res.json(await usersInputPort.updateUserCart({ userId: req.user._id, cart: req.body.cart }));
    }),
    updateFavorites: asyncHandler(async (req, res) => {
      res.json(
        await usersInputPort.updateUserFavorites({
          userId: req.user._id,
          productId: req.params.productId,
          action: req.body.action,
        })
      );
    }),
  };
};
