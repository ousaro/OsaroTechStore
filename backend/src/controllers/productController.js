import { json } from "express";
import Product from "../models/productModel.js";
import mongoose from "mongoose";


// get all products
const getAllProducts = async (req, res) =>{
    
    const products = await Product.find({}).sort({createdAt:-1});
    res.status(200).json(products); 
}


// get product by id
const getProductById = async (req, res) =>{
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        if (!product) {
          return res.status(404).json({ message: 'Product not found' });
        }
    
        // Find related products dynamically based on the current product
        const relatedProducts = await Product.findRelated(productId);
    
        res.json({ product, relatedProducts }); 
      } catch (error) {
        res.status(500).json({ message: 'Failed to fetch product', error });
      }
}


// add product
const addProduct = async (req, res) => {
    const { name,description, raw_price, discount, image, otherImages, categoryId, category, countInStock, moreInformations } = req.body;

    const ownerId = req.user._id
    const price = raw_price - (raw_price * discount / 100);
    const rating = "0";

    // check if any field is missing 
    let emptyFields = [];

    if(!name){
        emptyFields.push("name");
    }
    if(!description){
        emptyFields.push("description");
    }
    if(!raw_price){
        emptyFields.push("raw_price");
    }
    if(!discount){
        emptyFields.push("discount");
    }
    if(!image){
        emptyFields.push("image");
    }
    if(!otherImages){
        emptyFields.push("otherImages");
    }
    if(!categoryId){
        emptyFields.push("categoryId");
    }
    if(!category){
        emptyFields.push("category");
    }
    if(!countInStock){
        emptyFields.push("countInStock");
    }
    if(!moreInformations){
        emptyFields.push("moreInformations");
    }

    if(emptyFields.length > 0){
        return res.status(400).json({error:"Please fill in all the fields" , emptyFields})
    }

    if (raw_price < 0 || countInStock < 0) {
        return res.status(400).json({ error: "Price and countInStock cannot be negative" });

    }
    

    try{
        const product = await Product.create({ownerId, name,description,price, raw_price, discount,  image, otherImages, categoryId, category, countInStock, moreInformations, rating})

        res.status(201).json(product)


    }catch(error){
        res.status(400).json({error: error.message});
    }

    


}


// update product
const updateProduct = async (req, res) => {

    const { id } = req.params; 

    if (!mongoose.Types.ObjectId.isValid(id)) { 
        return res.status(404).json({ error: "Invalid Product ID" });
    }

    const updates = req.body; // { name, description, price, discount, image, otherImages, categoryId, category, countInStock, moreInformations , reviews} it can be any of these or all of them

    try {
        const product = await Product.findByIdAndUpdate(id, updates, { new: true }); 

        if (!product) { 
            return res.status(404).json({ error: "Product not found" });
        }

        res.json(product); 

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// delete product
const deleteProduct = async (req, res) => {
    const {id} = req.params ; 

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "No such Product"});
    }

    try {
        const deletedProduct = await Product.findByIdAndDelete({_id: id}); 

        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(deletedProduct);

    } catch (error) {
        res.status(500).json({ error: error.message }); 
    }
}




// update isNewProduct Status

const updateIsNewProductStatus = async () => {
    const currentDate = new Date();
  
    try {
      const products = await Product.find();
  
      for (const product of products) {
        const creationDate = new Date(product.createdAt);
        const daysSinceCreation = (currentDate - creationDate) / (1000 * 60 * 60 * 24);
        const isNewProduct = daysSinceCreation <= 30;
  
        if (product.isNewProduct !== isNewProduct) {
          product.isNewProduct = isNewProduct;
          await product.save();
        }
      }
  
      console.log('Product statuses updated successfully');
    } catch (error) {
      console.error('Error updating product statuses:', error);
    }
  };


// export controllers;

export {getAllProducts, getProductById, addProduct, updateProduct, deleteProduct, updateIsNewProductStatus}