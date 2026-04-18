// Initialize express router
import router from 'express';

import {
  getAllUsersHandler,
  getUserByIdHandler,
  updateUserHandler,
  updateUserPasswordHandler,
  deleteUserHandler,
} from "../modules/users/index.js";

// import middleware
import requireAuth from "../middleware/requireAuth.js"

// create router
const userRoutes = router();


// Middleware to require authentication for all routes in this router.
userRoutes.use(requireAuth);


// routes
// get All users
userRoutes.get('/', getAllUsersHandler);

// get user by Id
userRoutes.get('/:id', getUserByIdHandler)

// update user
userRoutes.put("/:id", updateUserHandler)

// update user password
userRoutes.put("/passUpdate/:id", updateUserPasswordHandler)


// delete user
userRoutes.delete("/:id", deleteUserHandler)




export default userRoutes;
