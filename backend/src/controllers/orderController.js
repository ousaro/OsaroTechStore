import Order from "../models/orderModel.js";
import mongoose from "mongoose";





// get all orders
const getAllOrders = async (req, res) =>{
    
    const orders = await Order.find({}).sort({createdAt:-1});
    res.status(200).json(orders);
   
}
 

// get order by Id
const getOrderById =  async (req, res) =>{
    
    res.status(200).json({message: "get  order by id"});
}



// add order
const addOrder = async (req, res) => {
    const { ownerId, products, totalPrice, status, address, paymentMethod, paymentStatus, transactionId, paymentDetails } = req.body;

    // Validate address structure
    if (!address || !address.city || !address.addressLine || !address.postalCode || !address.country) {
        return res.status(400).json({ message: 'Invalid address format' });
    }

    try {
        // Create the order document
        const order = await Order.create({
            ownerId,
            products,
            totalPrice,
            status,
            address,
            paymentMethod,
            paymentStatus,
            transactionId,
            paymentDetails
        });

        // Send a successful response with the created order
        res.status(201).json(order);
    } catch (error) {
        // Handle any errors during order creation
        console.error('Error saving order:', error);
        res.status(500).json({ message: 'Error saving order' });
    }
};


 
// update order
const updateOrder =  async (req, res) =>{
    
    const { id } = req.params; 

    if (!mongoose.Types.ObjectId.isValid(id)) { 
        return res.status(404).json({ error: "Invalid order ID" });
    }

    const updates = req.body; //  it can be any of model data or all of them


    try {
        const order = await Order.findByIdAndUpdate(id, updates, { new: true }); 

        if (!order) { 
            return res.status(404).json({ error: "Order not found" });
        }

        res.json(order); 

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
    
}


// delete order
const deleteOrder = async (req, res) =>{
    
    const {id} = req.params ; 

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "No such Order"});
    }

    try {
        const deletedOrder = await Order.findByIdAndDelete({_id: id}); 

        if (!deletedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json(deletedOrder);

    } catch (error) {
        res.status(500).json({ error: error.message }); 
    }
}


export {getAllOrders, getOrderById, addOrder, updateOrder, deleteOrder}
