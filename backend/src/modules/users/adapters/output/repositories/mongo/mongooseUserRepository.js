import bcrypt from "bcrypt";
import { createUserModel } from "../../../../../auth/index.js";
import { toUserRecord } from "../../persistence/mongo/userRecordMapper.js";

// Auth owns the shared User persistence model and exposes it through its public module API.
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
