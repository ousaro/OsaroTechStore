export const toAuthPrincipal = (user, token) =>
  Object.freeze({
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    picture: user.picture,
    admin: user.admin,
    favorites: user.favorites,
    cart: user.cart,
    address: user.address,
    city: user.city,
    phone: user.phone,
    country: user.country,
    postalCode: user.postalCode,
    state: user.state,
    token,
  });
