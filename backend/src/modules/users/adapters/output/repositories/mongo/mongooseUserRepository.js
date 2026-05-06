/**
 * Mongoose User Repository (Users module).
 * NOTE: Uses the same Mongoose model as the auth module (same collection).
 * The auth module owns credentials; this module owns profile fields.
 * Both access the same "User" document — splitting collections is a
 * future refactor when the bounded contexts are fully separated.
 */
import { createUserModel } from "../../../../auth/adapters/output/persistence/mongo/userModel.js";
import { toUserRecord } from "../../persistence/mongo/userRecordMapper.js";

export const createMongooseUserRepository = ({ dbClient }) => {
  const UserModel = createUserModel(dbClient);
  return {
    async findById(id)            { return toUserRecord(await UserModel.findById(id)); },
    async updateById(id, updates) { return toUserRecord(await UserModel.findByIdAndUpdate(id, updates, { new: true })); },
  };
};
