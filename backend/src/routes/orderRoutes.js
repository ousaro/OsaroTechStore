

// Initialize express router
import router from "express"

import {
  getAllOrdersHandler,
  getOrderByIdHandler,
  addOrderHandler,
  updateOrderHandler,
  deleteOrderHandler,
} from "../modules/orders/index.js";
 

// import middleware
import requireAuth from "../middleware/requireAuth.js"

// create router
const ordersRoutes = router();

// Middleware to require authentication for all routes in this router.
ordersRoutes.use(requireAuth);


// routes
    // get all orders
    ordersRoutes.get('/', getAllOrdersHandler)

    // get order by id
    ordersRoutes.get('/:id', getOrderByIdHandler)

    // add new order
    ordersRoutes.post('/', addOrderHandler)

    // update order
    ordersRoutes.put('/:id', updateOrderHandler)

    // delete order
    ordersRoutes.delete('/:id', deleteOrderHandler)




export default ordersRoutes;
