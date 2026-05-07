let sequence = 0;

export const buildProductPayload = ({ category, ...overrides } = {}) => {
  sequence += 1;
  return {
    name: `Phone ${sequence}`,
    description: "Unlocked device with warranty",
    price: 699,
    currency: "USD",
    category,
    stock: 12,
    images: ["https://cdn.example.test/phone.png"],
    status: "active",
    ...overrides,
  };
};

export const persistProduct = ({ productRepository, category, overrides = {} }) =>
  productRepository.create(buildProductPayload({ category, ...overrides }));
