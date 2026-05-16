/**
 * Mongoose User Repository (Users module).
 * NOTE: Uses the same Mongoose model as the auth module (same collection).
 * The auth module owns credentials; this module owns profile fields.
 * Both access the same "User" document — splitting collections is a
 * future refactor when the bounded contexts are fully separated.
 */
import bcrypt from "bcrypt";
import { createUserModel } from "../../../../../auth/index.js";
import { toUserRecord } from "../../persistence/mongo/userRecordMapper.js";

export const createMongooseUserRepository = ({ dbClient }) => {
  const UserModel = createUserModel(dbClient);
  return {
    async findById(id) {
      return toUserRecord(await UserModel.findById(id));
    },
    async findByIdWithPassword(id) {
      const doc = await UserModel.findById(id);
      if (!doc) return null;
      return { ...toUserRecord(doc), password: doc.password };
    },
    async updateById(id, updates) {
      return toUserRecord(await UserModel.findByIdAndUpdate(id, updates, { new: true }));
    },
    async updatePasswordById(id, password) {
      return toUserRecord(await UserModel.findByIdAndUpdate(id, { password }, { new: true }));
    },
    hashPassword(password) {
      return bcrypt.hash(password, 10);
    },
    comparePassword(plainPassword, hashedPassword) {
      return bcrypt.compare(plainPassword, hashedPassword);
    },
  };
};
