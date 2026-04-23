export const toUserReadModel = (user) => {
  if (!user) {
    return null;
  }

  return Object.fromEntries(
    Object.entries({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      admin: user.admin,
      picture: user.picture,
      phone: user.phone,
      address: user.address,
      city: user.city,
      country: user.country,
      state: user.state,
      postalCode: user.postalCode,
      favorites: user.favorites,
      cart: user.cart,
    }).filter(([, value]) => value !== undefined)
  );
};
