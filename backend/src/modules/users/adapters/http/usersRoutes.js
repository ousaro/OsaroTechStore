import router from "express";
import {
  getAllUsersHandler,
  getUserByIdHandler,
  updateUserHandler,
  updateUserPasswordHandler,
  deleteUserHandler,
} from "./httpHandlers.js";

export const createUsersRoutes = ({ requireAuth }) => {
  const usersRoutes = router();

  usersRoutes.use(requireAuth);
  usersRoutes.get("/", getAllUsersHandler);
  usersRoutes.get("/:id", getUserByIdHandler);
  usersRoutes.put("/:id", updateUserHandler);
  usersRoutes.put("/passUpdate/:id", updateUserPasswordHandler);
  usersRoutes.delete("/:id", deleteUserHandler);

  return usersRoutes;
};
