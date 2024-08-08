import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const addressSchema = new Schema({
    city: {
        type: String,
        required: true
    },
    addressLine: {
        type: String,
        required: true
    },
    postalCode: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    }
}, { _id: false });

const orderSchema = new Schema({
    ownerId: {
        type: String,
        required: true,
    },
    products: {
        type: Array,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    address: {
        type: addressSchema,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    paymentStatus: {
        type: String,
        required:true,
        default: 'pending' 
    },
    transactionId: {
        type: String,
        required: true
    },
    paymentDetails: {
        type: Schema.Types.Mixed,
        required: true
    }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;