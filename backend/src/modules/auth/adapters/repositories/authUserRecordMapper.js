export const toAuthUserRecord = (rawUser) => {
  if (!rawUser) {
    return null;
  }

  return {
    _id: rawUser._id,
    firstName: rawUser.firstName,
    lastName: rawUser.lastName,
    email: rawUser.email,
    password: rawUser.password,
    picture: rawUser.picture,
    admin: rawUser.admin,
    favorites: rawUser.favorites,
    cart: rawUser.cart,
    address: rawUser.address,
    city: rawUser.city,
    phone: rawUser.phone,
    country: rawUser.country,
    postalCode: rawUser.postalCode,
    state: rawUser.state,
  };
};
