import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { toUserRecord } from "./userRecordMapper.js";
import { assertAuthAccountAccessPort } from "../../ports/output/authAccountAccessPort.js";

export const createMongooseUserRepository = ({ authAccountAccess }) => {
  assertAuthAccountAccessPort(authAccountAccess, [
    "listManagedUserAccounts",
    "getManagedUserAccount",
    "updateManagedUserAccountProfile",
    "removeManagedUserAccount",
  ]);

  return {
    isValidId(id) {
      return mongoose.Types.ObjectId.isValid(id);
    },

    async findAllNonAdminSorted() {
      const docs = await authAccountAccess.listManagedUserAccounts();
      return docs.map(toUserRecord);
    },

    async findById(id) {
      const doc = await authAccountAccess.getManagedUserAccount(id);
      return doc ? toUserRecord(doc) : null;
    },

    async findByIdAndUpdate(id, patch) {
      const doc = await authAccountAccess.updateManagedUserAccountProfile(
        id,
        patch.toPrimitives()
      );
      return doc ? toUserRecord(doc) : null;
    },

    async findByIdAndDelete(id) {
      const doc = await authAccountAccess.removeManagedUserAccount(id);
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
