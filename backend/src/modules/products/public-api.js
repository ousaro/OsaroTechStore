export { productsInputPort } from "./composition.js";

export const removeProductsByCategory = (payload) => {
  return productsInputPort.removeProductsByCategory(payload);
};
