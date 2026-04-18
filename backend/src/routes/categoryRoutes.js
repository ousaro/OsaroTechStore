
// Initialize express router
import router from "express"

import {
  getAllCategoriesHandler,
  addNewCategoryHandler,
  deleteCategoryHandler,
} from "../modules/categories/index.js";

// import middleware
import requireAuth from "../middleware/requireAuth.js"

// create router
const categoryRoutes = router();

// Middleware to require authentication for all routes in this router.
categoryRoutes.use(requireAuth);


// routes
    // get all categories
categoryRoutes.get('/', getAllCategoriesHandler)

    // add new category
categoryRoutes.post('/', addNewCategoryHandler)

    // delete category
categoryRoutes.delete('/:id', deleteCategoryHandler)




export default categoryRoutes;

