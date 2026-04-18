// Initialize express router
import router from "express";

// to schedule a function to run periodically
import cron  from "node-cron"

// import middleware
import requireAuth from "../middleware/requireAuth.js"
import {
  getAllProductsHandler,
  getProductByIdHandler,
  addProductHandler,
  updateProductHandler,
  deleteProductHandler,
  runNewProductStatusRefreshHandler,
} from "../modules/products/index.js";

// create router
const productRoutes = router();


// Middleware to require authentication for all routes in this router.
productRoutes.use(requireAuth);


// routes

    // Route to get all products.
productRoutes.get('/', getAllProductsHandler);

    // Route to get a product by its ID.
productRoutes.get('/:id', getProductByIdHandler);

    // Route to add a new product.
productRoutes.post('/', addProductHandler);

    // Route to update a product by its ID.
productRoutes.put('/:id', updateProductHandler);

    //Route to delete a product by its ID.
productRoutes.delete('/:id', deleteProductHandler);


// Schedule the function to run every day at midnight
cron.schedule('0 0 * * *', () => {
    console.log('Running the updateIsNewProductStatus function');
    runNewProductStatusRefreshHandler();
});

export default productRoutes;
