import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';


const requireAuth = async (req,res, next)=>{

    // verify authentication
    const {authorization} = req.headers 

    if(!authorization){
        res.status(401).json({error:"Authorization token required"})
    }

    const token = authorization.split(' ')[1];

    try {
        
        // verigy is the token valid 
        const {_id} = jwt.verify(token, process.env.TOKEN_SECRET)

        // find the user and attach it to the request object
        req.user = await User.findOne({_id}).select("_id")

        next()

    } catch (error) {
        console.log(error)
        res.status(401).json({error: "Request is not authorized"})
    }

}

export default requireAuth;