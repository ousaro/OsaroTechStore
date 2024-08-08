import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js"






// get All category

const getAllCategories = async (req, res) =>{

    const categories = await Category.find({}).sort({createdAt:-1});
    res.status(200).json(categories);
   
}


// add new category

const addNewCategory = async (req, res) =>{
    const {name , description, image} = req.body;

     // check if any field is missing 
     let emptyFields = [];

     if(!name){
         emptyFields.push("name");
     }
     if(!description){
         emptyFields.push("description");
     }
     if(!image){
         emptyFields.push("image");
     }

     if(emptyFields.length > 0){
        return res.status(400).json({error:"Please fill in all the fields" , emptyFields})
    }

    try{
        const category = await Category.create({name, description, image})

        res.status(201).json(category)


    }catch(error){
        res.status(400).json({error: error.message});
    }


}


// delete category
const deleteCategory = async (req, res) => {
    const { id } = req.params; //  the ID of the category to delete is passed as a URL parameter

    if (!id) {
        return res.status(400).json({ error: "Category ID is required" });
    }

    try {
        // First, delete all products associated with this category
        await Product.deleteMany({ categoryId: id });

        // Then, delete the category itself
        const categoryDeleted = await Category.findByIdAndDelete({_id:id});

        if (!categoryDeleted) {
            return res.status(404).json({ error: "Category not found" });
        }

        res.status(200).json(categoryDeleted);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export {getAllCategories, addNewCategory, deleteCategory}