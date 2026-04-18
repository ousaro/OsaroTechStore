import router from "express";
import requireAuth from "../../../auth/infrastructure/http/requireAuthMiddleware.js";
import {
  getAllUsersHandler,
  getUserByIdHandler,
  updateUserHandler,
  updateUserPasswordHandler,
  deleteUserHandler,
} from "../../index.js";

const usersRoutes = router();
usersRoutes.use(requireAuth);
usersRoutes.get("/", getAllUsersHandler);
usersRoutes.get("/:id", getUserByIdHandler);
usersRoutes.put("/:id", updateUserHandler);
usersRoutes.put("/passUpdate/:id", updateUserPasswordHandler);
usersRoutes.delete("/:id", deleteUserHandler);

export default usersRoutes;
