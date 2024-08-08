import mongoose from "mongoose";


  const Schema = mongoose.Schema;

  const categorySchema = new Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    image:{
        type: String,
        required: true
    }


  },{
    timestamps: true
})


  const Category = mongoose.model("Category",categorySchema);

  export default Category;