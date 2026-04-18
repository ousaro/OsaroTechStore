export const toAuthPrincipal = (user, token) => {
  const {
    _id,
    firstName,
    lastName,
    email,
    picture,
    admin,
    favorites,
    cart,
    address,
    city,
    phone,
    country,
    postalCode,
    state,
  } = user;

  return { _id, firstName, lastName, email, picture, token, admin, favorites, cart, address, city, phone, country, postalCode, state };
};
