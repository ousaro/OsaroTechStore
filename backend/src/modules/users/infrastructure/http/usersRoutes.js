import router from "express";
import { verifyAccessToken } from "../../../auth/index.js";
import { createRequireAuthMiddleware } from "../../../../shared/infrastructure/http/createRequireAuthMiddleware.js";
import {
  getAllUsersHandler,
  getUserByIdHandler,
  updateUserHandler,
  updateUserPasswordHandler,
  deleteUserHandler,
} from "../../index.js";

const usersRoutes = router();
const requireAuth = createRequireAuthMiddleware({ verifyAccessToken });

usersRoutes.use(requireAuth);
usersRoutes.get("/", getAllUsersHandler);
usersRoutes.get("/:id", getUserByIdHandler);
usersRoutes.put("/:id", updateUserHandler);
usersRoutes.put("/passUpdate/:id", updateUserPasswordHandler);
usersRoutes.delete("/:id", deleteUserHandler);

export default usersRoutes;
