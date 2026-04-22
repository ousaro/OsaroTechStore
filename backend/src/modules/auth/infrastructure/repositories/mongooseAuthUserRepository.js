import bcrypt from "bcrypt";
import { AuthUnauthorizedError } from "../../application/errors/AuthApplicationError.js";
import UserModel from "../persistence/userModel.js";
import { toAuthUserRecord } from "./authUserRecordMapper.js";

export const createMongooseAuthUserRepository = () => {
  return {
    async findManagedAccountsSorted() {
      const docs = await UserModel.find({ admin: false }).sort({ createdAt: -1 });
      return docs.map(toAuthUserRecord);
    },
    async findByEmail(email) {
      const doc = await UserModel.findOne({ email });
      return toAuthUserRecord(doc);
    },
    async findById(id) {
      const doc = await UserModel.findById(id);
      return toAuthUserRecord(doc);
    },
    async create({ firstName, lastName, email, password, picture }) {
      const doc = await UserModel.create({ firstName, lastName, email, password, picture });
      return toAuthUserRecord(doc);
    },
    async findByIdAndUpdate(id, updates, options = {}) {
      const doc = await UserModel.findByIdAndUpdate(id, updates, options);
      return toAuthUserRecord(doc);
    },
    async findByIdAndDelete(filter) {
      const doc = await UserModel.findByIdAndDelete(filter);
      return toAuthUserRecord(doc);
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
      return { _id: user._id };
    },
  };
};
