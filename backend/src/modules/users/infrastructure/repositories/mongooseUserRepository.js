import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../../../../models/userModel.js";
import { toUserEntity } from "../../domain/entities/UserEntity.js";

export const createMongooseUserRepository = () => {
  return {
    isValidId(id) {
      return mongoose.Types.ObjectId.isValid(id);
    },

    async findAllNonAdminSorted() {
      const docs = await User.find({ admin: false }).sort({ createdAt: -1 });
      return docs.map(toUserEntity);
    },

    async findById(id) {
      const doc = await User.findById(id);
      return doc ? toUserEntity(doc) : null;
    },

    async findByIdAndUpdate(id, updates) {
      const doc = await User.findByIdAndUpdate(id, updates, { new: true });
      return doc ? toUserEntity(doc) : null;
    },

    async findByIdAndDelete(id) {
      const doc = await User.findByIdAndDelete({ _id: id });
      return doc ? toUserEntity(doc) : null;
    },

    comparePassword(plain, hash) {
      return bcrypt.compare(plain, hash);
    },

    hashPassword(password) {
      return bcrypt.hash(password, 10);
    },
  };
};
