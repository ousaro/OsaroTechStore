import mongoose from "mongoose";
import validator from "validator"
import bcrypt from "bcrypt"

const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        default: false
    },
    picture: {
        type: String,
        default: ""

    },
    phone: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default : ""
    },
    city:{
        type: String,
        default : ""
    },
    country:{    
        type: String,
        default: ""
    },
    state:{    
        type: String,
        default: ""
    },
    postalCode:{
        type: Number,
        default: 0
    },
    favorites: {
        type: Array,
        default: []
    },
    cart: {
        type: Array,
        default: []
    },
    
}, {
    timestamps: true
})

// statics method

userSchema.statics.register = async function(firstName,lastName,email,password, confirmPassword, picture){

    // checking if some fileds are empty
    if(!firstName || !lastName || !email || !password || !confirmPassword){
        throw Error("All field must be filled")
     }

    // checking for a valid email
    if(!validator.isEmail(email)){
        throw Error("Please enter a valid email")
    }

    // checking for a strong email
    if(!validator.isStrongPassword(password)){

        throw Error("Weak Password")

    }
    // check if the email already exist

    const exists = await this.findOne({email})

    if(exists){
     
        throw Error("Email already exist!")
        
    }

    // hashing the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password,salt)

    // checking if the password match
    const match = await bcrypt.compare(confirmPassword, hashedPassword)

    if(!match){
        throw Error("Password do not match")
    }
    
    // creating the user
    const user = await this.create({firstName,lastName,email,password:hashedPassword, picture})

    
    return user;
}


userSchema.statics.login = async function(email,password){

    // checking if some fileds are empty
    if(!email || !password){
        throw Error("All field must be filled")
     }
 
     // check if the email exist
     const user = await this.findOne({email})

     if(!user){
         throw Error("Email or Password are not correct")
     }

 
     // check if the password match
     const match = await bcrypt.compare(password, user.password)
 
     if(!user || !match){
         throw Error("Email or Password are not correct")
     }
 
 
     return user;
}

const User = mongoose.model('User', userSchema);
export default User;