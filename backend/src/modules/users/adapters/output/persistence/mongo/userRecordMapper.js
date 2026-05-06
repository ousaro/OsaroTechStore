/**
 * User Record Mapper.
 * Maps raw Mongoose documents to the profile record shape used by the Users module.
 */
export const toUserRecord = (doc) => {
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
