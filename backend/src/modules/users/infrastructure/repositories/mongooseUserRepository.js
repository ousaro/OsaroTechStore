import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { toUserRecord } from "./userRecordMapper.js";

export const createMongooseUserRepository = ({ userAccountAccess }) => {
  return {
    isValidId(id) {
      return mongoose.Types.ObjectId.isValid(id);
    },

    async findAllNonAdminSorted() {
      const docs = await userAccountAccess.find({ admin: false }).sort({ createdAt: -1 });
      return docs.map(toUserRecord);
    },

    async findById(id) {
      const doc = await userAccountAccess.findById(id);
      return doc ? toUserRecord(doc) : null;
    },

    async findByIdAndUpdate(id, patch) {
      const doc = await userAccountAccess.findByIdAndUpdate(id, patch.toPrimitives(), { new: true });
      return doc ? toUserRecord(doc) : null;
    },

    async findByIdAndDelete(id) {
      const doc = await userAccountAccess.findByIdAndDelete({ _id: id });
      return doc ? toUserRecord(doc) : null;
    },

    comparePassword(plain, hash) {
      return bcrypt.compare(plain, hash);
    },

    hashPassword(password) {
      return bcrypt.hash(password, 10);
    },
  };
};
