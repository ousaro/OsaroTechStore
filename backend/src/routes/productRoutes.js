// Initialize express router
import router from "express";

// to schedule a function to run periodically
import cron  from "node-cron"

// import controllers
import {getAllProducts, getProductById, addProduct, updateProduct, deleteProduct, updateIsNewProductStatus} from "../controllers/productController.js"

// import middleware
import requireAuth from "../middleware/requireAuth.js"

// create router
const productRoutes = router();


// Middleware to require authentication for all routes in this router.
productRoutes.use(requireAuth);


// routes

    // Route to get all products.
productRoutes.get('/', getAllProducts);

    // Route to get a product by its ID.
productRoutes.get('/:id', getProductById);

    // Route to add a new product.
productRoutes.post('/', addProduct);

    // Route to update a product by its ID.
productRoutes.put('/:id', updateProduct);

    //Route to delete a product by its ID.
productRoutes.delete('/:id', deleteProduct);


// Schedule the function to run every day at midnight
cron.schedule('0 0 * * *', () => {
    console.log('Running the updateIsNewProductStatus function');
    updateIsNewProductStatus();
  });

export default productRoutes;