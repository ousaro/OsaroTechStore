/**
 * Mongoose User Repository (Users module).
 * NOTE: Uses the same Mongoose model as the auth module (same collection).
 * The auth module owns credentials; this module owns profile fields.
 * Both access the same "User" document — splitting collections is a
 * future refactor when the bounded contexts are fully separated.
 */
import { createUserModel } from "../../../../auth/adapters/output/persistence/userModel.js"

const toRecord = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    _id:        obj._id?.toString(),
    firstName:  obj.firstName,
    lastName:   obj.lastName,
    email:      obj.email,
    phone:      obj.phone,
    address:    obj.address,
    city:       obj.city,
    country:    obj.country,
    state:      obj.state,
    postalCode: obj.postalCode,
    favorites:  obj.favorites,
    cart:       obj.cart,
    picture:    obj.picture,
  };
};

export const createMongooseUserRepository = ({ dbClient }) => {
  const UserModel = createUserModel(dbClient);
  return {
    async findById(id)            { return toRecord(await UserModel.findById(id)); },
    async updateById(id, updates) { return toRecord(await UserModel.findByIdAndUpdate(id, updates, { new: true })); },
  };
};
