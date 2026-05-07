export const buildDeliveryAddress = (overrides = {}) => ({
  street: "1 Test Way",
  city: "Casablanca",
  state: "Casablanca-Settat",
  postalCode: "20000",
  country: "MA",
  ...overrides,
});

export const buildOrderLine = (overrides = {}) => ({
  productId: overrides.productId ?? "product-test-id",
  name: overrides.name ?? "Phone",
  price: overrides.price ?? 699,
  quantity: overrides.quantity ?? 1,
});

export const buildOrderPayload = (overrides = {}) => ({
  orderLines: [buildOrderLine(overrides.orderLine)],
  deliveryAddress: buildDeliveryAddress(overrides.deliveryAddress),
  currency: overrides.currency ?? "USD",
});
