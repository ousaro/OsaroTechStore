/**
 * Auth User Record Mapper.
 * Maps raw Mongoose document → internal record shape.
 * Password is excluded by default — use findByIdWithPassword when needed.
 */
export const toAuthUserRecord = (doc) => {
  if (!doc) return null;

  return {
    _id:        doc._id?.toString(),
    firstName:  doc.firstName,
    lastName:   doc.lastName,
    email:      doc.email,
    admin:      doc.admin,
    picture:    doc.picture,
    phone:      doc.phone,
    address:    doc.address,
    city:       doc.city,
    country:    doc.country,
    state:      doc.state,
    postalCode: doc.postalCode,
    favorites:  doc.favorites,
    cart:       doc.cart,
  };
};
