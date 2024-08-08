import mongoose from "mongoose";


const Schema = mongoose.Schema;

const productSchema = new Schema({
    ownerId:{
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    raw_price: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        required: true
    }, 
    image: {
        type: String,
        required: true
    },
    otherImages: {
        type: Array,
        required: true
    },
    categoryId: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    countInStock: {
        type: Number,
        required: true
    },
    moreInformations: {
        type: String,
        required: true
    },
    reviews: {
        type: Array,
        required: true,
        default : []
    },
    rating: {
        type: String,
        required: true,
        default: 0
    },
    isNewProduct: {
        type: Boolean,
        required: true,
        default : true
    },
    salesCount: {
        type: Number,
        required: true,
        default: 0
    },
    lastSold: {
        type: Date,
        required: true,
        default: Date.now
    }
    
}, {
    timestamps: true
})


productSchema.statics.findRelated = async function(productId) {
    const product = await this.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }
  
    // Example criteria: find products in the same category and with similar tags
    const relatedProducts = await this.find({
      _id: { $ne: productId }, // Exclude the current product
      category: product.category,
    }).limit(10); // Limit to 10 related products
  
    return relatedProducts;
  };
  

const Product = mongoose.model('Product', productSchema);
export default Product;