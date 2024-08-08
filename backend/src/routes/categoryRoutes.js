
// Initialize express router
import router from "express"

// import controllers
import {getAllCategories, addNewCategory, deleteCategory} from "../controllers/categoryController.js"


// import middleware
import requireAuth from "../middleware/requireAuth.js"

// create router
const categoryRoutes = router();

// Middleware to require authentication for all routes in this router.
categoryRoutes.use(requireAuth);


// routes
    // get all categories
categoryRoutes.get('/',getAllCategories)

    // add new category
categoryRoutes.post('/', addNewCategory)

    // delete category
categoryRoutes.delete('/:id', deleteCategory)




export default categoryRoutes;


