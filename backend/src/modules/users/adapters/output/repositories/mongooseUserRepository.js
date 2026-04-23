import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { toUserRecord } from "./userRecordMapper.js";
import { createValidatedAuthAccountAccess } from "../../../ports/output/authAccountAccessPort.js";

export const createMongooseUserRepository = ({ authUserManagement }) => {
  const validatedAuthUserManagement = createValidatedAuthAccountAccess(
    authUserManagement
  );

  return {
    isValidId(id) {
      return mongoose.Types.ObjectId.isValid(id);
    },

    async findAllNonAdminSorted() {
      const docs = await validatedAuthUserManagement.listManagedUserProfiles();
      return docs.map(toUserRecord);
    },

    async findById(id) {
      const doc = await validatedAuthUserManagement.getManagedUserProfile(id);
      return doc ? toUserRecord(doc) : null;
    },

    async findByIdAndUpdate(id, patch) {
      const doc = await validatedAuthUserManagement.updateManagedUserProfile(
        id,
        patch.toPrimitives()
      );
      return doc ? toUserRecord(doc) : null;
    },

    async findByIdAndDelete(id) {
      const doc = await validatedAuthUserManagement.removeManagedUserProfile(id);
      return doc ? toUserRecord(doc) : null;
    },

    async getCredentialsById(id) {
      return validatedAuthUserManagement.getManagedUserCredentials(id);
    },

    async updateCredentialsById(id, updates) {
      const doc = await validatedAuthUserManagement.updateManagedUserCredentials(
        id,
        updates
      );
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
