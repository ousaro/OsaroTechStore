import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { toUserRecord } from "./userRecordMapper.js";
import { assertAuthAccountAccessPort } from "../../ports/output/authAccountAccessPort.js";

export const createMongooseUserRepository = ({ authUserManagement }) => {
  assertAuthAccountAccessPort(authUserManagement, [
    "listManagedUserProfiles",
    "getManagedUserProfile",
    "updateManagedUserProfile",
    "removeManagedUserProfile",
    "getManagedUserCredentials",
    "updateManagedUserCredentials",
  ]);

  return {
    isValidId(id) {
      return mongoose.Types.ObjectId.isValid(id);
    },

    async findAllNonAdminSorted() {
      const docs = await authUserManagement.listManagedUserProfiles();
      return docs.map(toUserRecord);
    },

    async findById(id) {
      const doc = await authUserManagement.getManagedUserProfile(id);
      return doc ? toUserRecord(doc) : null;
    },

    async findByIdAndUpdate(id, patch) {
      const doc = await authUserManagement.updateManagedUserProfile(
        id,
        patch.toPrimitives()
      );
      return doc ? toUserRecord(doc) : null;
    },

    async findByIdAndDelete(id) {
      const doc = await authUserManagement.removeManagedUserProfile(id);
      return doc ? toUserRecord(doc) : null;
    },

    async getCredentialsById(id) {
      return authUserManagement.getManagedUserCredentials(id);
    },

    async updateCredentialsById(id, updates) {
      const doc = await authUserManagement.updateManagedUserCredentials(id, updates);
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
