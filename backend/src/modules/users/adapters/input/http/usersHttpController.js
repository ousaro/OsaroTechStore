import { asyncHandler } from "../../../../../shared/infrastructure/http/middleware/asyncHandler.js";

export const createUsersHttpController = ({ commandPort, queryPort }) => ({
  getMyProfile: asyncHandler(async (req, res) => {
    res.json(await queryPort.getUserProfile({ requesterId: req.user._id }));
  }),
  getUserById: asyncHandler(async (req, res) => {
    res.json(await queryPort.getUserProfile({ requesterId: req.user._id, targetId: req.params.id }));
  }),
  updateProfile: asyncHandler(async (req, res) => {
    res.json(await commandPort.updateUserProfile({ requesterId: req.user._id, updates: req.body }));
  }),
  updateCart: asyncHandler(async (req, res) => {
    res.json(await commandPort.updateUserCart({ userId: req.user._id, cart: req.body.cart }));
  }),
  updateFavorites: asyncHandler(async (req, res) => {
    res.json(await commandPort.updateUserFavorites({
      userId: req.user._id, productId: req.params.productId, action: req.body.action,
    }));
  }),
});
