import bcrypt from "bcrypt";
import { AuthUnauthorizedError } from "../../application/errors/AuthApplicationError.js";
import UserModel from "../persistence/userModel.js";

export const createMongooseAuthUserRepository = () => {
  return {
    find(filter) {
      return UserModel.find(filter);
    },
    async findByEmail(email) {
      return UserModel.findOne({ email });
    },
    findById(id) {
      return UserModel.findById(id);
    },
    async create({ firstName, lastName, email, password, picture }) {
      return UserModel.create({ firstName, lastName, email, password, picture });
    },
    findByIdAndUpdate(id, updates, options = {}) {
      return UserModel.findByIdAndUpdate(id, updates, options);
    },
    findByIdAndDelete(filter) {
      return UserModel.findByIdAndDelete(filter);
    },
    hashPassword(password) {
      return bcrypt.hash(password, 10);
    },
    comparePassword(plainPassword, hashedPassword) {
      return bcrypt.compare(plainPassword, hashedPassword);
    },
    async findUserIdOnly(userId) {
      const user = await UserModel.findOne({ _id: userId }).select("_id");
      if (!user) {
        throw new AuthUnauthorizedError("Request is not authorized");
      }
      return user;
    },
  };
};
