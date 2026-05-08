import { apiRequest, userToken } from "./client";
import { endpoints } from "./endpoints";

export const getAllCategories = async (user) => {
  try {
    return await apiRequest(endpoints.categories.root, { token: userToken(user) });
  } catch (error) {
    return { error };
  }
};


export const addNewCategory = async (user, category) => {
  try {
    return await apiRequest(endpoints.categories.root, {
      method: "POST",
      body: category,
      token: userToken(user),
    });
  } catch (error) {
    return { error, emptyFields: [] };
  }
}




export const deleteCategory = async (user, categoryId) =>{
  try {
    return await apiRequest(endpoints.categories.byId(categoryId), {
      method: "DELETE",
      token: userToken(user),
    });
  } catch (error) {
    return { error };
  }
}
