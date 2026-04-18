import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    admin: { type: Boolean, default: false },
    picture: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    country: { type: String, default: "" },
    state: { type: String, default: "" },
    postalCode: { type: Number, default: 0 },
    favorites: { type: Array, default: [] },
    cart: { type: Array, default: [] },
  },
  { timestamps: true }
);

userSchema.statics.register = async function (firstName, lastName, email, password, confirmPassword, picture) {
  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    throw Error("All field must be filled");
  }

  if (!validator.isEmail(email)) {
    throw Error("Please enter a valid email");
  }

  if (!validator.isStrongPassword(password)) {
    throw Error("Weak Password");
  }

  const exists = await this.findOne({ email });
  if (exists) {
    throw Error("Email already exist!");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const match = await bcrypt.compare(confirmPassword, hashedPassword);
  if (!match) {
    throw Error("Password do not match");
  }

  const user = await this.create({ firstName, lastName, email, password: hashedPassword, picture });
  return user;
};

userSchema.statics.login = async function (email, password) {
  if (!email || !password) {
    throw Error("All field must be filled");
  }

  const user = await this.findOne({ email });
  if (!user) {
    throw Error("Email or Password are not correct");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!user || !match) {
    throw Error("Email or Password are not correct");
  }

  return user;
};

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
