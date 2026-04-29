import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName:  { type: String, required: true, trim: true },
    lastName:   { type: String, required: true, trim: true },
    email:      { type: String, required: true, unique: true, trim: true, lowercase: true },
    password:   { type: String, required: true },
    admin:      { type: Boolean, default: false },
    picture:    { type: String, default: "" },
    phone:      { type: String, default: "" },
    address:    { type: String, default: "" },
    city:       { type: String, default: "" },
    country:    { type: String, default: "" },
    state:      { type: String, default: "" },
    postalCode: { type: Number, default: 0 },
    favorites:  { type: Array,  default: [] },
    cart:       { type: Array,  default: [] },
  },
  { timestamps: true }
);

export const createUserModel = (connection) =>
  connection.models.User ?? connection.model("User", userSchema);
