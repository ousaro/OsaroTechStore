import bcrypt from "bcrypt";
import UserModel from "../persistence/userModel.js";

export const createMongooseAuthUserRepository = () => {
  return {
    async findByEmail(email) {
      return UserModel.findOne({ email });
    },
    async create({ firstName, lastName, email, password, picture }) {
      return UserModel.create({ firstName, lastName, email, password, picture });
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
        const error = new Error("Request is not authorized");
        error.statusCode = 401;
        throw error;
      }
      return user;
    },
  };
};
