import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { toUserRecord } from "./userRecordMapper.js";

export const createMongooseUserRepository = ({ userAccounts }) => {
  return {
    isValidId(id) {
      return mongoose.Types.ObjectId.isValid(id);
    },

    async findAllNonAdminSorted() {
      const docs = await userAccounts.listNonAdminAccounts();
      return docs.map(toUserRecord);
    },

    async findById(id) {
      const doc = await userAccounts.getAccountById(id);
      return doc ? toUserRecord(doc) : null;
    },

    async findByIdAndUpdate(id, patch) {
      const doc = await userAccounts.updateAccountById(id, patch.toPrimitives());
      return doc ? toUserRecord(doc) : null;
    },

    async findByIdAndDelete(id) {
      const doc = await userAccounts.deleteAccountById(id);
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
