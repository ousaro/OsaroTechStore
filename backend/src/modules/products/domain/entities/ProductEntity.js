export const toProductEntity = (rawProduct) => {
  // Domain mapping hook to keep infrastructure details out of use-cases.
  // For now this is passthrough while the module is incrementally migrated.
  return rawProduct;
};
