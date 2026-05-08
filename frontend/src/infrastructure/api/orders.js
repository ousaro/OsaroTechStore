import { apiRequest, userToken } from "./client";
import { endpoints } from "./endpoints";

export const getAllOrders = async (user) => {
  try {
    return await apiRequest(endpoints.orders.root, { token: userToken(user) });
  } catch (error) {
    return { error };
  }
};




export const addNewOrder = async (user, orderData) => {
  try {
    return await apiRequest(endpoints.orders.root, {
      method: "POST",
      body: orderData,
      token: userToken(user),
    });
  } catch (error) {
    return { error };
  }
}


export const updateOrder = async (user, orderId, update) =>{
  try {
    return await apiRequest(endpoints.orders.byId(orderId), {
      method: "PUT",
      body: update,
      token: userToken(user),
    });
  } catch (error) {
    return { error };
  }
}


export const deleteOrder = async (user, orderId) =>{
  try {
    return await apiRequest(endpoints.orders.byId(orderId), {
      method: "DELETE",
      token: userToken(user),
    });
  } catch (error) {
    return { error };
  }
}
