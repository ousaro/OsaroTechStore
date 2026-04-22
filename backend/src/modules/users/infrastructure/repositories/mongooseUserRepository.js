import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { toUserRecord } from "./userRecordMapper.js";

export const createMongooseUserRepository = ({
  deleteAccountById,
  getAccountById,
  listNonAdminAccounts,
  updateAccountById,
}) => {
  return {
    isValidId(id) {
      return mongoose.Types.ObjectId.isValid(id);
    },

    async findAllNonAdminSorted() {
      const docs = await listNonAdminAccounts();
      return docs.map(toUserRecord);
    },

    async findById(id) {
      const doc = await getAccountById(id);
      return doc ? toUserRecord(doc) : null;
    },

    async findByIdAndUpdate(id, patch) {
      const doc = await updateAccountById(id, patch.toPrimitives());
      return doc ? toUserRecord(doc) : null;
    },

    async findByIdAndDelete(id) {
      const doc = await deleteAccountById(id);
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
