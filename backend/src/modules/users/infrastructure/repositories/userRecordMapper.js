export const toUserRecord = (rawUser) => {
  if (!rawUser) {
    return null;
  }

  return {
    _id: rawUser._id,
    firstName: rawUser.firstName,
    lastName: rawUser.lastName,
    email: rawUser.email,
    admin: rawUser.admin,
    picture: rawUser.picture,
    phone: rawUser.phone,
    address: rawUser.address,
    city: rawUser.city,
    country: rawUser.country,
    state: rawUser.state,
    postalCode: rawUser.postalCode,
    favorites: rawUser.favorites,
    cart: rawUser.cart,
  };
};
