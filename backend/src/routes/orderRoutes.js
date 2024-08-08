

// Initialize express router
import router from "express"

// import controllers
import {getAllOrders, getOrderById, addOrder, updateOrder, deleteOrder} from "../controllers/orderController.js"


// import middleware
import requireAuth from "../middleware/requireAuth.js"

// create router
const ordersRoutes = router();

// Middleware to require authentication for all routes in this router.
ordersRoutes.use(requireAuth);


// routes
    // get all orders
    ordersRoutes.get('/',getAllOrders)

    // get order by id
    ordersRoutes.get('/:id', getOrderById)

    // add new order
    ordersRoutes.post('/', addOrder)

    // update order
    ordersRoutes.put('/:id', updateOrder)

    // delete order
    ordersRoutes.delete('/:id', deleteOrder)




export default ordersRoutes;
