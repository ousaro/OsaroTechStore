export const toUserReadModel = (record) => record
  ? {
      _id:        record._id?.toString(),
      firstName:  record.firstName,
      lastName:   record.lastName,
      email:      record.email,
      phone:      record.phone,
      address:    record.address,
      city:       record.city,
      country:    record.country,
      state:      record.state,
      postalCode: record.postalCode,
      favorites:  record.favorites,
      cart:       record.cart,
      picture:    record.picture,
    }
  : null;
