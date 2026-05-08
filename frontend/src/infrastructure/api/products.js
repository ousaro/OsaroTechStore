import { apiRequest, userToken } from "./client";
import { endpoints } from "./endpoints";

export const getAllProducts = async (user) => {
  try {
    return await apiRequest(endpoints.products.root, { token: userToken(user) });
  } catch (error) {
    return { error };
  }
};


export const getProductById = async (user, productId) => {
  try {
    const result = await apiRequest(endpoints.products.byId(productId), { token: userToken(user) });
    return { ...result, isLoading: false };
  } catch (error) {
    return { error, isLoading: false };
  }
};


export const addNewProduct = async (user, product) => {
  try {
    return await apiRequest(endpoints.products.root, {
      method: "POST",
      body: product,
      token: userToken(user),
    });
  } catch (error) {
    return { error, emptyFields: [] };
  }
};


export const updateProduct = async (user, productId, update) =>{
  try {
    return await apiRequest(endpoints.products.byId(productId), {
      method: "PUT",
      body: update,
      token: userToken(user),
    });
  } catch (error) {
    return { error };
  }
}

export const deleteProduct = async (user, productId) =>{
  try {
    return await apiRequest(endpoints.products.byId(productId), {
      method: "DELETE",
      token: userToken(user),
    });
  } catch (error) {
    return { error };
  }
}
