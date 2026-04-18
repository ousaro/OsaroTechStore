import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { toUserEntity } from "../../domain/entities/UserEntity.js";

export const createMongooseUserRepository = ({ authUserAccess }) => {
  return {
    isValidId(id) {
      return mongoose.Types.ObjectId.isValid(id);
    },

    async findAllNonAdminSorted() {
      const docs = await authUserAccess.find({ admin: false }).sort({ createdAt: -1 });
      return docs.map(toUserEntity);
    },

    async findById(id) {
      const doc = await authUserAccess.findById(id);
      return doc ? toUserEntity(doc) : null;
    },

    async findByIdAndUpdate(id, patch) {
      const doc = await authUserAccess.findByIdAndUpdate(id, patch.toPrimitives(), { new: true });
      return doc ? toUserEntity(doc) : null;
    },

    async findByIdAndDelete(id) {
      const doc = await authUserAccess.findByIdAndDelete({ _id: id });
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
