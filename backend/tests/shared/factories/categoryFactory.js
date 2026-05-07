let sequence = 0;

export const buildCategoryPayload = (overrides = {}) => {
  sequence += 1;
  return {
    name: `Smartphones ${sequence}`,
    description: "Portable consumer technology",
    ...overrides,
  };
};

export const persistCategory = ({ categoryRepository, overrides = {} }) =>
  categoryRepository.create(buildCategoryPayload(overrides));
