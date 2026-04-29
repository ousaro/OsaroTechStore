/**
 * Mongoose Auth User Repository.
 *
 *  - Accepts dbClient instead of importing a global mongoose model.
 *    The composition root passes the connection — the repo creates its model.
 *  - hashPassword / comparePassword moved here (auth concern, not domain).
 *  - findManagedAccountsSorted returns raw records (mapper normalizes).
 */
import bcrypt from "bcrypt";
import { createUserModel } from "../persistence/userModel.js";
import { toAuthUserRecord } from "./authUserRecordMapper.js";

export const createMongooseAuthUserRepository = ({ dbClient }) => {
  const UserModel = createUserModel(dbClient);

  return {
    async findManagedAccountsSorted() {
      const docs = await UserModel.find({ admin: false }).sort({ createdAt: -1 });
      return docs.map(toAuthUserRecord);
    },

    async findByEmail(email) {
      const doc = await UserModel.findOne({ email });
      return doc ? toAuthUserRecord(doc) : null;
    },

    async findById(id) {
      const doc = await UserModel.findById(id);
      return doc ? toAuthUserRecord(doc) : null;
    },

    async findByIdWithPassword(id) {
      // Returns the raw record INCLUDING the password hash (for credential checks)
      const doc = await UserModel.findById(id);
      if (!doc) return null;
      return { ...toAuthUserRecord(doc), password: doc.password };
    },

    async create({ firstName, lastName, email, password, picture }) {
      const doc = await UserModel.create({ firstName, lastName, email, password, picture });
      return toAuthUserRecord(doc);
    },

    async findByIdAndUpdate(id, updates, options = { new: true }) {
      const doc = await UserModel.findByIdAndUpdate(id, updates, options);
      return doc ? toAuthUserRecord(doc) : null;
    },

    async findByIdAndDelete(id) {
      const doc = await UserModel.findByIdAndDelete(id);
      return doc ? toAuthUserRecord(doc) : null;
    },

    async findUserExists(userId) {
      return UserModel.exists({ _id: userId });
    },

    hashPassword(password) {
      return bcrypt.hash(password, 10);
    },

    comparePassword(plainPassword, hashedPassword) {
      return bcrypt.compare(plainPassword, hashedPassword);
    },
  };
};
