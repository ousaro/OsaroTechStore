// Initialize express router
import router from 'express';


// import controller
import { getAllUsers, getUserById,updateUser, updateUserPassword,deleteUser  } from '../controllers/userController.js';

// import middleware
import requireAuth from "../middleware/requireAuth.js"

// create router
const userRoutes = router();


// Middleware to require authentication for all routes in this router.
userRoutes.use(requireAuth);


// routes
    // get All users
userRoutes.get('/', getAllUsers);

    // get user by Id
userRoutes.get('/:id', getUserById)

    // update user 
userRoutes.put("/:id", updateUser)

    // update user password
userRoutes.put("/passUpdate/:id", updateUserPassword)


    // delete user
userRoutes.delete("/:id", deleteUser)




export default userRoutes; 