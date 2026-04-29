import { Router } from "express";
export const createUsersRoutes = ({ controller, requireAuth }) => {
  const router = Router();
  router.use(requireAuth);
  router.get("/me",                      controller.getMyProfile);
  router.get("/:id",                     controller.getUserById);
  router.put("/me",                      controller.updateProfile);
  router.put("/me/cart",                 controller.updateCart);
  router.put("/me/favorites/:productId", controller.updateFavorites);
  return router;
};
