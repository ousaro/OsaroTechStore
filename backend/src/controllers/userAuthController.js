import User from '../models/userModel.js';
import jwt from "jsonwebtoken";
import dotenv from "dotenv"



dotenv.config()

// create jwt
const createToken = (_id)=>{
    return jwt.sign({_id}, process.env.TOKEN_SECRET, {expiresIn: "2d"})
}



// Register a new user => /api/auth/register

const registerUser = async (req, res) => {
    try {
        const { firstName,lastName,email,password, confirmPassword, picture } = req.body;
        const user = await User.register(firstName,lastName,email,password, confirmPassword, picture);

        // create token
        const _id = user._id
        const token = createToken(_id);

        // other user proprites
        const admin = user.admin;
        const favorites = user.favorites;
        const cart = user.cart;
        const {address, city,phone,country,postalCode,state} = user;


        res.status(200).json({_id,firstName,lastName,email, picture, token, admin, favorites, cart, address, city,phone,country,postalCode,state})
        console.log("token",token)
        
    }  
    catch (error) {
        res.status(400).json({error: error.message});
        console.log("error");
    }
}

// Login user => /api/auth/login

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.login(email,password);

        const {_id,firstName, lastName, picture, admin, favorites, cart, address, city,phone,country,postalCode, state} = user;

        // create token
        const token = createToken(_id);




        res.status(200).json({_id,firstName, lastName, email, picture, token, admin, favorites, cart,address, city,phone,country,postalCode,state})
        console.log("token",token)
        //console.log("user",address)
    }
    catch (error) {
        
        res.status(400).json({error: error.message});
        console.log("error");
    }
}


export { registerUser, loginUser};