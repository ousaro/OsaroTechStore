import User from '../models/userModel.js';
import mongoose from 'mongoose';
import validator from "validator"
import bcrypt from "bcrypt"


// get all users
const getAllUsers = async (req, res) =>{
    
    const users = await User.find({ admin: false }).sort({createdAt: -1})
    res.status(200).json(users)
}

// get user by id
const getUserById = async (req, res) =>{

    const {id} = req.params ; 

    
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "No such user"});
    }

    res.status(200).json({message: `user id ${id} `})
}

const updateUserPassword = async (req, res) => {

    const { id } = req.params;
    const adminId = req.user._id; // extracting admin's ID from the request ( from a JWT)
    
    const updates = req.body; // is can be {any field of user model} or {newPassword, currentPassword}
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: `No such user ${id}` });
    }

    try {
        if (updates.newPassword) {
            if (id.toString() === adminId.toString()) {
  
                // Admin changing their own password
                const admin = await User.findById(id);
                if (!admin) {
                    return res.status(404).json({ error: "User not found" });
                }

                // Check if the current password matches
                const match = await bcrypt.compare(updates.currentPassword, admin.password);
                if (!match) {
                    console.log("Current password is incorrect")
                    return res.status(400).json({ error: "Current password is incorrect" });
                }

                // Hash the new password
                const hashedPassword = await bcrypt.hash(updates.newPassword, 10);
                updates.password = hashedPassword;
            } else {
                // Admin resetting another user's password
                const hashedPassword = await bcrypt.hash(updates.newPassword, 10);
                updates.password = hashedPassword;
            }
        }

        if(!updates.currentPassword || !updates.newPassword || !updates.confirmPassword){
            console.log("All fields must be filled")
            return res.status(400).json({ error: "All fields must be filled" });
        }

        // Remove password fields from updates to avoid unnecessary updates
        delete updates.newPassword;
        delete updates.currentPassword;

        // Update the user
        const user = await User.findByIdAndUpdate(id, updates, { new: true });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

//  update user 
const updateUser = async (req, res) => {
    const { id } = req.params;
    
    const updates = req.body; // is can be {any field of user model} or {newPassword, currentPassword}
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: `No such user ${id}` });
    }
    
    try {
        // Update the user
        const user = await User.findByIdAndUpdate(id, updates, { new: true });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// delete user
const deleteUser = async (req, res) =>{
    const {id} = req.params ; 

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "No such Product"});
    }

    try {
        const deletedUser = await User.findByIdAndDelete({_id: id}); 

        if (!deletedUser) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(deletedUser);

    } catch (error) {
        res.status(500).json({ error: error.message }); 
    }
}








export {getAllUsers, getUserById,updateUser, updateUserPassword,deleteUser };