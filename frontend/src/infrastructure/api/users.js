import { apiRequest, userToken } from "./client";
import { endpoints } from "./endpoints";

export const getAllUsers = async (user) => {
  try {
    return await apiRequest(endpoints.auth.adminUsers, { token: userToken(user) });
  } catch (error) {
    return { error };
  }
};



export const updateUser = async (user,userId, update) =>{
  const isSelfUpdate = user?._id === userId;

  try {
    return await apiRequest(isSelfUpdate ? endpoints.users.me : endpoints.auth.adminUser(userId), {
      method: "PUT",
      body: update,
      token: userToken(user),
    });
  } catch (error) {
    return { error };
  }
}


export const updateUserPassword = async (user,userId, update) =>{
  return {
    json: {
      error: "Password updates are not exposed in the current OpenAPI spec.",
      requestedUserId: userId,
      attemptedFields: Object.keys(update || {}),
    },
    ok: false,
    status: 501,
  };
}


export const deleteUser = async (user, userId) =>{
  try {
    return await apiRequest(endpoints.auth.adminUser(userId), {
      method: "DELETE",
      token: userToken(user),
    });
  } catch (error) {
    return { error };
  }
}
